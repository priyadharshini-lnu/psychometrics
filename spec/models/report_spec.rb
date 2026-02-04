# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Report, type: :model do
  let(:report) { build(:report) }

  context 'validation Internal report' do
    let(:report) { build(:report, provider: 'internal') }

    let(:common_assessment) { create(:assessment) }
    let(:saville_assessment) { create(:assessment, :saville) }
    let(:hogan_assessment) { create(:assessment, :hogan) }
    let(:mhs_assessment) { create(:assessment, :mhs) }

    subject { report.valid? }

    it 'valid' do
      report.assessment_ids = [common_assessment.id, saville_assessment.id, saville_assessment.id, mhs_assessment.id]
      subject
      expect(report.errors.details[:base]).not_to include(error: :assessments_not_saville)
      expect(report.errors.details[:base]).not_to include(error: :assessments_not_hogan)
      expect(report.errors.details[:base]).not_to include(error: :assessments_not_mhs)
    end
  end

  context 'validation Saville report' do
    context '#all_assessments_saville' do
      let(:report) { build(:report, provider: 'saville', external_settings: { report_id: 'reportId' }) }

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
      let(:report) { build(:report, provider: 'hogan', external_settings: { report_id: 'reportId' }) }

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

  context 'validation Mhs report' do
    context '#all_assessments_mhs' do
      let(:report) { build(:report, provider: 'mhs', external_settings: { report_id: 'reportId' }) }

      let(:common_assessment) { create(:assessment) }
      let(:mhs_assessment) { create(:assessment, :mhs) }
      subject { report.valid? }

      it 'invalid' do
        report.assessment_ids = [common_assessment.id, mhs_assessment.id]
        subject
        expect(report.errors[:base]).to include(I18n.t('admin.assessments_not_mhs'))
      end

      it 'valid' do
        report.assessment_ids = [mhs_assessment.id]
        subject
        expect(report.errors[:base]).not_to include(I18n.t('admin.assessments_not_mhs'))
      end
    end
  end
end
