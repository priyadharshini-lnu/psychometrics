# frozen_string_literal: true

class AdminJob < ApplicationJob
  queue_as :low_priority

  rescue_from Exception do |error|
    arguments.first.complete!(arguments.first.error_messages, error.message)
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
    assessment_scoring_export: AdminJobs::AssessmentRawExport,
    assessment_norm_export: AdminJobs::AssessmentNormExport,
    assessment_raw_factor_export: AdminJobs::AssessmentRawFactorExport,
    external_assessment_export: AdminJobs::ExternalAssessmentExport,
    import_sms_invites: AdminJobs::ImportSmsInvites,
    send_sms_invites: AdminJobs::SendSmsInvites,
    completion_status_export: AdminJobs::CompletionStatusExport,
    compact_completion_status_export: AdminJobs::CompactCompletionStatusExport,
    threesixty_campaign_export_completion_status: AdminJobs::ThreesixtyCampaignExportCompletionStatus,
    export_users: AdminJobs::ExportUsers,
    import_accesssheet: AdminJobs::ImportAccesssheet,
    import_question_translations: AdminJobs::ImportQuestionTranslations,
    regenerate_threesixty_report: AdminJobs::RegenerateThreesixtyReport,
    bulk_regenerate_threesixty_reports: AdminJobs::BulkRegenerateThreesixtyReports,
    bulk_create_workshop_invites: AdminJobs::BulkCreateWorkshopInvites,
    super_admin_assessment_raw_result_export: AdminJobs::SuperAdmin::AssessmentRawResultExport,
    super_admin_assessment_raw_factor_export: AdminJobs::SuperAdmin::AssessmentRawFactorExport,
    workshop_status_export: AdminJobs::WorkshopStatusExport,
    bulk_rescore_campaign_factors: AdminJobs::BulkRescoreCampaignFactors,
    import_assessment_questions: AdminJobs::ImportAssessmentQuestions,
    assign_reports_and_assessments: AdminJobs::AssignReportsAndAssessments,
    export_campaign_scorings: AdminJobs::ExportCampaignScorings,
    export_reports_and_assessments: AdminJobs::ExportReportsAndAssessments,
    super_admin_assessment_norm_export: AdminJobs::SuperAdmin::AssessmentNormExport,
    super_admin_datasheet_export: AdminJobs::SuperAdmin::DatasheetExport,
    data_report_export: AdminJobs::DataReportExport,
    super_admin_external_assessment_export: AdminJobs::SuperAdmin::ExternalAssessmentExport,
    export_admin_with_permissions: AdminJobs::ExportAdminsWithPermissions,
    bulk_download_user_reports: AdminJobs::BulkDownloadUserReports,
    export_campaign_factors: AdminJobs::ExportCampaignFactors,
    import_campaign_factors: AdminJobs::ImportCampaignFactors,
    create_threesixty_campaign: AdminJobs::CreateThreesixtyCampaign,
    remap_report_assessment: AdminJobs::RemapReportAssessment,
    threesixty_campaign_export_scores: AdminJobs::ThreesixtyCampaignExportScores,
    import_external_campaign_scoring: AdminJobs::ImportExternalCampaignScoring,
    export_factor_translations: AdminJobs::ExportFactorTranslations,
    import_factor_translations: AdminJobs::ImportFactorTranslations,
    import_factors: AdminJobs::ImportFactors,
    normalize_factor_scores: AdminJobs::NormalizeFactorScores,
    export_occupations: AdminJobs::ExportOccupations,
    export_user_report_events: AdminJobs::ExportUserReportEvents,
    migrate_assessment_translations: AdminJobs::MigrateAssessmentTranslations,
    add_campaign_reports: AdminJobs::AddCampaignsReports,
    import_skills: AdminJobs::ImportSkillsJob,
    import_development_actions: AdminJobs::ImportDevelopmentActionsJob,
    export_development_actions: AdminJobs::ExportDevelopmentActionsJob,
    assign_idp_to_users: AdminJobs::AssignIdpToUsers,
    export_norm: AdminJobs::NormExport,
    import_norm: AdminJobs::ImportNorm,
    import_development_action_translations: AdminJobs::ImportDevelopmentActionTranslationsJob,
    export_development_action_translations: AdminJobs::ExportDevelopmentActionTranslationsJob
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
      record
    end
  end
end
