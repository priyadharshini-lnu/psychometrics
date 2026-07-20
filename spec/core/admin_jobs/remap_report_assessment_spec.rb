# frozen_string_literal: true

require 'rails_helper'

describe AdminJobs::RemapReportAssessment do
  let(:report) { create(:report) }
  let(:owner) { create(:user) }

  let(:job_record) do
    create(
      :admin_job_record,
      operation: :remap_report_assessment,
      owner: owner,
      data: {
        'report_id' => report.id,
        'current_assessment_id' => 1,
        'new_assessment_id' => 2
      }
    )
  end

  subject { described_class.new(job_record) }

  describe '#valid?' do
    context 'when the report exists' do
      it 'returns true' do
        expect(subject.valid?).to be true
      end
    end

    context 'when the report no longer exists' do
      before do
        job_record.data['report_id'] = -1
      end

      it 'returns false' do
        expect(subject.valid?).to be false
      end
    end
  end

  describe '#generate_title_link' do
    it 'returns href and label' do
      result = subject.generate_title_link

      expect(result[:href]).to eq("/administration/reports/#{report.id}")
      expect(result[:label]).to eq(report.name.to_s)
    end
  end
end
