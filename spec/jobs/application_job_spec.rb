# frozen_string_literal: true

require 'rails_helper'

class SampleJobWithTracking < ApplicationJob
  track_job_run

  def perform; end
end

class SampleJobWithoutTracking < ApplicationJob
  def perform; end
end

RSpec.describe ApplicationJob, type: :job do
  describe 'Job with job tracking enabled' do
    it 'creates last_job_run record on perform if it does not exist' do
      expect LastJobRun.find_by(name: SampleJobWithTracking.name).nil?

      expect do
        SampleJobWithTracking.perform_now
      end.to change(LastJobRun, :count).by(1)

      last_job_run_record = LastJobRun.find_by(name: SampleJobWithTracking.name)

      expect last_job_run_record.present?
      expect(last_job_run_record.started_at).to be_within(1.second).of(Time.zone.now)
    end

    it 'updates last_job_run record on perform if the record exists' do
      job_run_record = create(:last_job_run, :completed_yesterday, name: SampleJobWithTracking.name)

      expect(job_run_record.started_at).to be_within(1.second).of(1.day.ago)

      expect do
        SampleJobWithTracking.perform_now
      end.to change(LastJobRun, :count).by(0)

      expect(job_run_record.reload.started_at).to be_within(1.second).of(Time.zone.now)
      expect(job_run_record.reload.updated_at).to be_within(1.second).of(Time.zone.now)
    end
  end

  describe 'Job without job tracking enabled' do
    it 'does not create last_job_run record on perform' do
      expect do
        SampleJobWithoutTracking.perform_now
      end.to change(LastJobRun, :count).by(0)

      expect LastJobRun.find_by(name: SampleJobWithoutTracking.name).nil?
    end
  end
end
