# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Campaigns::CreateFromAssessmentAndReport do
  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let!(:campaign_name) { Faker::Name.name }
  let(:form) { Threesixty::Campaigns::CreateForm.new(name: campaign_name) }
  let(:assessment) { create(:assessment) }
  let(:report) { create(:report, owner_id: client.id) }
  let!(:user) { create(:client_admin, client: client) }

  describe '.call' do
    it 'creates a Threesixty::Campaign record' do
      threesixty_campaign = described_class.call!(
        assessment, report, form, project, user, resource_name: campaign_name
      )
      expect(threesixty_campaign).to be_an_instance_of(Threesixty::Campaign)
      expect(threesixty_campaign).to be_persisted
      expect(threesixty_campaign.name).to eq(campaign_name)
      expect(threesixty_campaign.assessment.name).to eq(campaign_name)
      expect(threesixty_campaign.report.name).to eq(campaign_name)
    end

    it 'creates a Campaign record' do
      threesixty_campaign = described_class.call!(assessment, report, form, project, user)

      expect(threesixty_campaign.campaign).to be_persisted
    end

    it 'creates a Threesixty::Option record for a Threesixty::Campaign' do
      threesixty_campaign = described_class.call!(assessment, report, form, project, user)

      expect(threesixty_campaign.option).to be_persisted
    end

    it 'creates assessment' do
      threesixty_campaign = described_class.call!(assessment, report, form, project, user)

      expect(threesixty_campaign.assessment).to be_persisted
    end

    it 'creates report' do
      threesixty_campaign = described_class.call!(assessment, report, form, project, user)

      expect(threesixty_campaign.report).to be_persisted
    end

    it 'creates dimension' do
      threesixty_campaign = described_class.call!(assessment, report, form, project, user)

      expect(threesixty_campaign.assessment.dimension).to be_persisted
    end

    context 'dimension' do
      let(:skills_form) do
        Threesixty::Campaigns::CreateForm.new(
          name: 'Skills Campaign',
          threesixty_category: 'skills_rater'
        )
      end

      it 'creates regular dimension for normal 360 campaign' do
        threesixty_campaign = described_class.call!(assessment, report, form, project, user)

        expect(threesixty_campaign.assessment.dimension).to be_persisted
        expect(threesixty_campaign.assessment.dimension.dimension_type).not_to eq('skills_rater')
      end

      it 'creates a dimension of type skills_rater for skills_rater 360 campaign' do
        threesixty_campaign = described_class.call!(assessment, report, skills_form, project, user)

        dimension = threesixty_campaign.assessment.dimension

        expect(dimension).to be_persisted
        expect(dimension.dimension_type).to eq('skills_rater')
        expect(dimension.name).to eq("#{project.name} - Skills Rater")
      end
    end

    # rubocop:disable Lint/EmptyBlock
    it 'updates factor_scoring with correct factor_id' do
    end

    it 'sets correct assessment_id for report filter' do
    end
    # rubocop:enable all

    it 'sets correct assessment_id for assessments_reports' do
      threesixty_campaign = described_class.call!(assessment, report, form, project, user)

      expect(threesixty_campaign.report.assessments_reports.first.assessment_id).
        to eq(threesixty_campaign.assessment_id)
    end

    it 'sets correct assessment_id for report modules' do
      page = create(:page, report: report)
      create(:module, page: page)

      threesixty_campaign = described_class.call!(assessment, report, form, project, user)
      report_module = threesixty_campaign.report.modules.first

      expect(report_module.assessment_id).to eq(threesixty_campaign.assessment_id)
    end

    it 'remap factor in report module' do
      page = create(:page, report: report)
      factor = create(:factor, dimension: assessment.dimension)
      create(:module, page: page, props: { factorId: factor.id })

      threesixty_campaign = described_class.call!(assessment, report, form, project, user)
      report_module = threesixty_campaign.report.modules.first
      expected_factor = threesixty_campaign.assessment.dimension.all_factors.find_by(name: factor.name)

      expect(report_module.props['factorId']).to eq(expected_factor.id)
      expect(report_module.props['factorId']).to_not eq(factor.id)
    end
  end
end
