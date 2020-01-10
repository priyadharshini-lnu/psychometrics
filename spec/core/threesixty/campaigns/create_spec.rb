# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Campaigns::Create do
  let(:project) { create(:project) }
  let(:form) { Threesixty::Campaigns::CreateForm.new(name: 'New campaign') }

  describe '.call' do
    it 'calls CreateEmptyCampaign when assessments are not passed' do
      threesixty_campaign = create(:threesixty_campaign)
      expect(Threesixty::Campaigns::CreateEmptyCampaign).to receive(:call!).
        and_return(threesixty_campaign)

      described_class.call!(project, form)
    end

    it 'calls CreateFromAssessmentAndReport when assessment_id is passed in a form' do
      threesixty_campaign = create(:threesixty_campaign)
      expect(Threesixty::Campaigns::CreateFromAssessmentAndReport).to receive(:call!).
        and_return(threesixty_campaign)
      form.assessment_id = create(:assessment).id
      form.type = Threesixty::Campaign::PREVIOUS_360

      described_class.call!(project, form)
    end

    it 'calls CreateFromAssessmentAndReport when campaign_id is passed in a form' do
      threesixty_campaign = create(:threesixty_campaign)
      expect(Threesixty::Campaigns::CreateFromAssessmentAndReport).to receive(:call!).
        and_return(threesixty_campaign)
      form.campaign_template_id = create(:campaign_template).id
      form.type = Threesixty::Campaign::STANDARD_360

      described_class.call!(project, form)
    end
  end
end
