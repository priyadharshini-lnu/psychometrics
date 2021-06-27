# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Report, type: :model do
  let(:report) { build(:report) }

  it 'deletes saville_report_setting if any assessment is not of type saville' do
    saville_assessment = create(:assessment, :saville)
    report = create(:report, :saville, assessments: [saville_assessment])
    expect(report.saville_report_setting).to_not eq(nil)

    common_assessment = create(:assessment)
    create(:assessments_report, report: report, assessment: common_assessment)
    report.reload.update_attribute(:name, 'New Name')
    expect(report.reload.saville_report_setting).to eq(nil)
  end

  context 'validation Saville report' do
    context '#all_assessments_saville' do
      let(:saville_report_setting) { build(:saville_report_setting) }
      let(:report) { build(:report, saville_report_setting: saville_report_setting) }

      let(:common_assessment) { create(:assessment) }
      let(:saville_assessment) { create(:assessment, :saville) }

      subject { report.valid? }

      it 'invalid' do
        report.assessment_ids = [common_assessment.id, saville_assessment.id]
        subject
        expect(report.errors.details[:base]).to include(error: :assessments_not_saville)
      end

      it 'valid' do
        report.assessment_ids = [saville_assessment.id]
        subject
        expect(report.errors.details[:base]).not_to include(error: :assessments_not_saville)
      end
    end
  end

  context 'validation number of assessments' do
    context 'greater then max' do
      it 'should be invalid' do
        report.assessments = build_list(:assessment, Report::MAX_ASSESSMENT_COUNT + 1)
        expect(report.valid?).to be_falsey
      end
    end

    context 'lower then min' do
      it 'should be invalid' do
        report.assessments = []
        expect(report.valid?).to be_falsey
      end
    end

    context 'valid number' do
      it 'should be valid' do
        expect(report.valid?).to be_truthy
      end
    end
  end

  context 'validation Hogan report' do
    context '#all_assessments_hogan' do
      let(:hogan_report_setting) { build(:hogan_report_setting) }
      let(:report) { build(:report, hogan_report_setting: hogan_report_setting) }

      let(:common_assessment) { create(:assessment) }
      let(:hogan_assessment) { create(:assessment_hogan) }

      subject { report.valid? }

      it 'invalid' do
        report.assessment_ids = [common_assessment.id, hogan_assessment.id]
        subject
        expect(report.errors.details[:base]).to include(error: :assessments_not_hogan)
      end

      it 'valid' do
        report.assessment_ids = [hogan_assessment.id]
        subject
        expect(report.errors.details[:base]).not_to include(error: :assessments_not_hogan)
      end
    end
  end
end
