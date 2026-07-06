# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobRecord, type: :model do
  describe 'operation enum' do
    it 'includes bulk factor score export operations' do
      expect(described_class.operations).to include(
        'bulk_export_raw_factor_scores',
        'bulk_export_norm_factor_scores',
        'assessment_raw_ai_factor_export'
      )
    end

    it 'includes the assessment copy operation' do
      expect(described_class.operations).to include('copy_assessment')
    end
  end

  describe '#increment_completed_tasks' do
    it 'increments completed_tasks!' do
      admin_job_record = create(:admin_job_record, completed_tasks: 0, total_tasks: 2)
      admin_job_record.increment_completed_tasks!

      expect(admin_job_record.completed_tasks).to eq(1)
      expect(admin_job_record.completed?).to eq(false)
    end

    it 'marks status as completed, if completed_tasks is equal to total_tasks' do
      admin_job_record = create(:admin_job_record, completed_tasks: 0, total_tasks: 1)
      admin_job_record.increment_completed_tasks!

      expect(admin_job_record.completed?).to eq(true)
    end
  end

  describe '#complete!' do
    it 'marks status as completed and broadcast update event' do
      admin_job_record = create(:admin_job_record)
      expect(admin_job_record).to receive(:broadcast).with(:update)
      admin_job_record.complete!

      expect(admin_job_record.completed?).to eq(true)
    end

    it 'saves error_messages if passed' do
      admin_job_record = create(:admin_job_record)
      errors = ['Something went wrong']
      admin_job_record.complete!(errors)

      expect(admin_job_record.completed?).to eq(true)
      expect(admin_job_record.error_messages).to eq(errors)
    end

    it 'saves exception if passed' do
      admin_job_record = create(:admin_job_record)
      errors = ['Something went wrong']
      exception = 'Some exception'
      admin_job_record.complete!(errors, exception)

      expect(admin_job_record.completed?).to eq(true)
      expect(admin_job_record.error_messages).to eq(errors)
      expect(admin_job_record.exception).to eq(exception)
    end
  end
end
