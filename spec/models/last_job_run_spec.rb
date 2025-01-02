# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LastJobRun, type: :model do
  describe 'creating' do
    it 'sets the default value of started_at and finished_at as current time if they are not present' do
      last_job_run_record = create(:last_job_run)

      expect(last_job_run_record.started_at).to be_within(1.second).of(Time.zone.now)
      expect(last_job_run_record.finished_at).to be_within(1.second).of(Time.zone.now)
    end
  end
end
