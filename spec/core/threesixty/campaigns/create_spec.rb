# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Campaigns::Create do
  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:form) { Threesixty::Campaigns::CreateForm.new(name: 'New campaign') }
  let!(:user) { create(:superadmin) }

  describe '.call' do
    it 'calls CreateEmptyCampaign when assessments are not passed' do
      threesixty_campaign = create(:threesixty_campaign)
      expect(Threesixty::Campaigns::CreateEmptyCampaign).to receive(:call!).
        and_return(threesixty_campaign)

      described_class.call!(project, form, user)
    end

    it 'persists campaign name for selected locale on created campaign' do
      threesixty_campaign = create(:threesixty_campaign)
      expect(Threesixty::Campaigns::CreateEmptyCampaign).to receive(:call!).
        and_return(threesixty_campaign)

      form.name = 'Campaign AR'
      form.name_locale = 'ar'

      described_class.call!(project, form, user)

      threesixty_campaign.campaign.reload
      Mobility.with_locale('ar') do
        expect(threesixty_campaign.campaign.name).to eq('Campaign AR')
      end
    end

    it 'calls CreateFromAssessmentAndReport when assessment_id is passed in a form' do
      threesixty_campaign = create(:threesixty_campaign)
      expect(Threesixty::Campaigns::CreateFromAssessmentAndReport).to receive(:call!).
        and_return(threesixty_campaign)
      form.assessment_id = create(:assessment).id
      form.threesixty_type = Threesixty::Campaign::PREVIOUS_360

      described_class.call!(project, form, user)
    end

    it 'calls CreateFromAssessmentAndReport when campaign_id is passed in a form' do
      threesixty_campaign = create(:threesixty_campaign)
      expect(Threesixty::Campaigns::CreateFromAssessmentAndReport).to receive(:call!).
        and_return(threesixty_campaign)
      form.campaign_template_id = create(:campaign_template).id
      form.threesixty_type = Threesixty::Campaign::STANDARD_360

      described_class.call!(project, form, user)
    end

    it 'calls CopyAsTemplateOrCampaign when campaign_template has campaign_id' do
      existing_campaign = create(:campaign)
      campaign_template = create(:campaign_template, campaign: existing_campaign)
      cloned_threesixty_campaign = create(:threesixty_campaign)

      form.threesixty_type = Threesixty::Campaign::STANDARD_360
      form.campaign_template_id = campaign_template.id

      expect(Threesixty::Campaigns::CopyAsTemplateOrCampaign).to receive(:call).
        with(existing_campaign, is_template: false, form: form, project: project).
        and_return({ ok: { campaign: double(threesixty_campaign: cloned_threesixty_campaign) } })

      described_class.call!(project, form, user)
    end
  end

  describe 'Standard 360' do
    let!(:dimension) { create(:dimension, :with_factor) }
    let!(:assessment) { create(:assessment, owner_id: client.id, category: 'threesixty', dimension_id: dimension.id) }
    let!(:campaign_template) { create(:campaign_template, assessment: assessment) }

    let!(:question) { create(:question, type: 'MatrixTable', assessment: assessment) }
    let!(:question2) { create(:question, type: 'MatrixTable', assessment: assessment) }
    let!(:question3) { create(:question, type: 'StaticContent', assessment: assessment) }

    let!(:block) { create(:block) }
    let!(:block3) { create(:block) }
    let!(:block2) { create(:block) }

    let!(:params) do
      {
        data: {
          type: 'threesixty_campaigns',
          attributes: {
            name: 'new campaign',
            threesixty_type: Threesixty::Campaign::STANDARD_360,
            campaign_template_id: campaign_template.id,
            factors: assessment.dimension.factor_ids,
            questions: [
              { id: question.id, selected_choice_indexes: [0, 2] }
            ]
          }
        }
      }
    end

    before do
      block.questions << question
      block2.questions << question2
      block2.questions << question3
      assessment.blocks << block
      assessment.blocks << block2
      assessment.blocks << block3
      question.factors_scorings.create(
        assessment: assessment,
        factor_id: dimension.factor_ids.first, question_id: question.id,
        props: [
          { 'choice' => 0, 'scale' => 0, 'value' => 1 },
          { 'choice' => 0, 'scale' => 1, 'value' => 2 },
          { 'choice' => 0, 'scale' => 2, 'value' => 3 },
          { 'choice' => 1, 'scale' => 0, 'value' => 4 },
          { 'choice' => 1, 'scale' => 1, 'value' => 5 },
          { 'choice' => 1, 'scale' => 2, 'value' => 6 },
          { 'choice' => 2, 'scale' => 0, 'value' => 7 },
          { 'choice' => 2, 'scale' => 1, 'value' => 8 },
          { 'choice' => 2, 'scale' => 2, 'value' => 9 }
        ]
      )
      assessment.factors_scoring.create(factor_id: dimension.factor_ids.first, question_id: question2.id)
    end

    it 'create campaign' do
      form = Threesixty::Campaigns::CreateForm.from_params(params[:data][:attributes])

      campaign = Threesixty::Campaigns::Create.call!(project, form, user)
      a = Assessment.find(campaign.assessment_id)
      expect(a.name).to eq('new campaign')
      expect(a.questions.size).to eq(2)
      expect(a.blocks.size).to eq(2)
      expect(a.questions.first.props['choices']).to eq(2)
      expect(a.questions.first.props['choicesTexts']).to eq(%w[1 3])
      expect(a.questions.first.factors_scorings.first.props).to eq([{ 'choice' => 0, 'scale' => 0, 'value' => 1 },
                                                                    { 'choice' => 0, 'scale' => 1, 'value' => 2 },
                                                                    { 'choice' => 0, 'scale' => 2, 'value' => 3 },
                                                                    { 'choice' => 1, 'scale' => 0, 'value' => 7 },
                                                                    { 'choice' => 1, 'scale' => 1, 'value' => 8 },
                                                                    { 'choice' => 1, 'scale' => 2, 'value' => 9 }])
      expect(a.blocks.first.questions.first.type).to eq('MatrixTable')
      expect(a.blocks.last.questions.last.type).to include('StaticContent')
    end
  end
end
