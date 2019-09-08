# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Report, type: :model do
  let(:report) { build(:report) }

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
