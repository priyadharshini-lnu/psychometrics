# frozen_string_literal: true

class AdminJob < ApplicationJob
  queue_as :low_priority

  around_perform :around_perform

  rescue_from Exception do |error|
    errors = arguments.first.error_messages + [error.inspect]
    arguments.first.update!(error_messages: errors, status: :completed, progress: 100)
    Raven.capture_exception(error)
    AdminJob.broadcast(:update, arguments.first)
  end

  JOBS = {
    import_users: AdminJobs::ImportUsers,
    rescore_assessment: AdminJobs::RescoreAssessment,
    rescore_user_assessment: AdminJobs::RescoreUserAssessment,
    import_scoring_data: AdminJobs::ImportData,
    import_raw_data: AdminJobs::ImportData,
    bulk_download_reports: AdminJobs::BulkDownloadReports,
    bulk_regenerate_reports: AdminJobs::BulkRegenerateReports,
    bulk_regenerate_user_reports: AdminJobs::BulkRegenerateUserReports
  }.freeze

  def perform(record)
    response = JOBS[record.operation.to_sym].call!(record)
    record.update(response) if response
  end

  def add_error(error)
    errors = arguments.first.error_messages + [error]
    arguments.first.update!(error_messages: errors)
  end

  class << self
    def update_progress(record, progress)
      record.update!(progress: progress)
      broadcast(:update, record)
    end

    def broadcast(action, record)
      AdminJobChannel.broadcast_to(record.owner, action: action, job: AdminJobRecordSerializer.new(record))
    end

    def call(operation, data, owner, file = nil)
      record = AdminJobRecord.create!(operation: operation, data: data, file: file, owner: owner)
      AdminJob.broadcast(:create, record)
      perform_later(record)
    end
  end

  private

  def around_perform
    arguments.first.update!(status: :in_progress)
    yield
    arguments.first.update!(status: :completed, progress: 100)
    AdminJob.broadcast(:update, arguments.first)
  end
end
