# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobRecord, type: :model do
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
  end
end
