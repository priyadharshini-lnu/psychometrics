# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Campaigns::CreateFromAssessmentAndReport do
  let(:project) { create(:project) }
  let(:form) { Threesixty::Campaigns::CreateForm.new(name: 'New campaign') }
  let(:assessment) { create(:assessment) }
  let(:report) { create(:report) }

  describe '.call' do
    it 'creates a Threesixty::Campaign record' do
      threesixty_campaign = described_class.call!(assessment, report, form, project)

      expect(threesixty_campaign).to be_an_instance_of(Threesixty::Campaign)
      expect(threesixty_campaign).to be_persisted
      expect(threesixty_campaign.name).to eq(form.name)
    end

    it 'creates a Campaign record' do
      threesixty_campaign = described_class.call!(assessment, report, form, project)

      expect(threesixty_campaign.campaign).to be_persisted
    end

    it 'creates a Threesixty::Option record for a Threesixty::Campaign' do
      threesixty_campaign = described_class.call!(assessment, report, form, project)

      expect(threesixty_campaign.option).to be_persisted
    end

    it 'creates assessment' do
      threesixty_campaign = described_class.call!(assessment, report, form, project)

      expect(threesixty_campaign.assessment).to be_persisted
    end

    it 'creates report' do
      threesixty_campaign = described_class.call!(assessment, report, form, project)

      expect(threesixty_campaign.report).to be_persisted
    end

    it 'creates dimension' do
      threesixty_campaign = described_class.call!(assessment, report, form, project)

      expect(threesixty_campaign.assessment.dimension).to be_persisted
    end

    it 'updates factor_scoring with correct factor_id' do
    end

    it 'sets correct assessment_id for report filter' do
    end

    it 'sets correct assessment_id for assessments_reports' do
      threesixty_campaign = described_class.call!(assessment, report, form, project)

      expect(threesixty_campaign.report.assessments_reports.first.assessment_id).
        to eq(threesixty_campaign.assessment_id)
    end

    it 'sets correct assessment_id for report modules' do
      page = create(:page, report: report)
      create(:module, page: page)

      threesixty_campaign = described_class.call!(assessment, report, form, project)
      report_module = threesixty_campaign.report.modules.first

      expect(report_module.assessment_id).to eq(threesixty_campaign.assessment_id)
    end

    it 'remap factor in report module' do
      page = create(:page, report: report)
      factor = create(:factor, dimension: assessment.dimension)
      create(:module, page: page, props: { factorId: factor.id })

      threesixty_campaign = described_class.call!(assessment, report, form, project)
      report_module = threesixty_campaign.report.modules.first
      expected_factor_id = threesixty_campaign.assessment.dimension.all_factors.find_by(name: factor.name)

      expect(report_module.props['factorId']).to eq(expected_factor_id)
      expect(report_module.props['factorId']).to_not eq(factor.id)
    end
  end
end
