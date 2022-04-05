# frozen_string_literal: true

class AdminJob < ApplicationJob
  queue_as :low_priority

  rescue_from Exception do |error|
    errors = arguments.first.error_messages + [error.message]
    arguments.first.complete!(errors)
    Sentry.capture_exception(error)
  end

  JOBS = {
    import_users: AdminJobs::ImportUsers,
    import_assessors: AdminJobs::ImportAssessors,
    rescore_assessment: AdminJobs::RescoreAssessment,
    rescore_user_assessment: AdminJobs::RescoreUserAssessment,
    import_scoring_data: AdminJobs::ImportData,
    import_raw_data: AdminJobs::ImportData,
    bulk_download_reports: AdminJobs::BulkDownloadReports,
    bulk_regenerate_reports: AdminJobs::BulkRegenerateReports,
    bulk_regenerate_user_reports: AdminJobs::BulkRegenerateUserReports,
    import_datasheet: AdminJobs::ImportDatasheet,
    copy_dimension: AdminJobs::CopyDimension,
    export_report_data: AdminJobs::ExportReportData,
    assessment_raw_result_export: AdminJobs::AssessmentRawResultExport,
    assessment_scoring_export: AdminJobs::AssessmentScoringExport,
    assessment_norm_export: AdminJobs::AssessmentNormExport,
    assessment_raw_factor_export: AdminJobs::AssessmentRawFactorExport,
    external_assessment_export: AdminJobs::ExternalAssessmentExport,
    import_sms_invites: AdminJobs::ImportSmsInvites,
    send_sms_invites: AdminJobs::SendSmsInvites,
    completion_status_export: AdminJobs::CompletionStatusExport,
    threesixty_campaign_export_completion_status: AdminJobs::ThreesixtyCampaignExportCompletionStatus
  }.freeze

  def perform(record)
    record.update!(status: :in_progress)
    JOBS[record.operation.to_sym].call(record) do
      on(:ok) do |response|
        record.complete!
        record.update(response) if response
      end
      on(:waiting) do |response|
        record.update(response) if response
      end
    end
  end

  class << self
    def call(operation, data, owner, file = nil)
      record = AdminJobRecord.create!(operation: operation, data: data, file: file, owner: owner)
      record.broadcast(:create)
      perform_later(record)
    end
  end
end
