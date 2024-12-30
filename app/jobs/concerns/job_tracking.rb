# frozen_string_literal: true

module JobTracking
  extend ActiveSupport::Concern

  included do
    attr_reader :last_job_started_at

    class_attribute :track_job_run_enabled, default: false

    around_perform :track_job_run_execution, if: -> { track_job_run_enabled }
  end

  class_methods do
    def track_job_run
      self.track_job_run_enabled = true
    end
  end

  def current_started_at
    @current_started_at ||= Time.zone.now
  end

  def job_tracker_record
    @job_tracker_record ||= LastJobRun.find_or_create_by(name: self.class.name)
  end

  private

  def track_job_run_execution
    @last_job_started_at = job_tracker_record.started_at
    job_tracker_record.update!(started_at: current_started_at)

    begin
      yield
    ensure
      job_tracker_record.update!(finished_at: Time.zone.now)
    end
  end
end
