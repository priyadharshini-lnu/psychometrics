# frozen_string_literal: true

class AdminJob < ApplicationJob
  queue_as :low_priority

  rescue_from Exception do |error|
    arguments.first.complete!(arguments.first.error_messages, error.message)
    Sentry.capture_exception(error)
  end

  class AlreadyExistsError < StandardError
    def initialize
      super(I18n.t('admin_jobs.bulk_download_idp_reports.already_exists'))
    end
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
    assessment_raw_ai_factor_export: AdminJobs::AssessmentRawAIFactorExport,
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
    bulk_update_evaluation_status: AdminJobs::BulkUpdateEvaluationStatus,
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
    import_proficiency_levels: AdminJobs::ImportProficiencyLevelsJob,
    import_development_actions: AdminJobs::ImportDevelopmentActionsJob,
    export_development_actions: AdminJobs::ExportDevelopmentActionsJob,
    assign_idp_to_users: AdminJobs::AssignIdpToUsers,
    export_skill_translations: AdminJobs::ExportSkillTranslationsJob,
    import_skill_translations: AdminJobs::ImportSkillTranslationsJob,
    export_skills: AdminJobs::ExportSkillsJob,
    import_development_action_translations: AdminJobs::ImportDevelopmentActionTranslationsJob,
    export_development_action_translations: AdminJobs::ExportDevelopmentActionTranslationsJob,
    export_norm: AdminJobs::NormExport,
    import_norm: AdminJobs::ImportNorm,
    export_assessment_questions: AdminJobs::ExportAssessmentQuestions,
    export_dimension_as_json: AdminJobs::ExportDimensionAsJson,
    import_dimension_from_json: AdminJobs::ImportDimensionFromJson,
    import_skill_rater_taxonomies: AdminJobs::SkillRater::ImportTaxonomies,
    export_proficiency_levels: AdminJobs::ExportProficiencyLevelsJob,
    export_proficiency_level_translations: AdminJobs::ExportProficiencyLevelTranslationsJob,
    import_proficiency_level_translations: AdminJobs::ImportProficiencyLevelTranslationsJob,
    import_job_roles_translations: AdminJobs::ImportJobRolesTranslations,
    export_job_roles_translations: AdminJobs::ExportJobRolesTranslations,
    export_reflection_questions: AdminJobs::ExportReflectionQuestionsJob,
    import_reflection_questions: AdminJobs::ImportReflectionQuestionsJob,
    export_dashboard_as_file: AdminJobs::ExportDashboardAsFile,
    bulk_download_idp_reports: AdminJobs::BulkDownloadIdpReports,
    sync_skill_rater_assessment_entities: AdminJobs::SkillRater::SyncAssessmentEntities,
    copy_as_template_or_campaign: AdminJobs::CopyAsTemplateOrCampaign,
    export_interview_questions: AdminJobs::ExportInterviewQuestionsJob,
    import_interview_questions: AdminJobs::ImportInterviewQuestionsJob,
    import_assessment_translations: AdminJobs::ImportAssessmentTranslations,
    bulk_generate_user_campaign_ai_artifact_results: AdminJobs::BulkGenerateUserCampaignAIArtifactResults,
    export_campaign_ai_artifacts: AdminJobs::ExportCampaignAIArtifactsJob,
    import_campaign_ai_artifacts: AdminJobs::ImportCampaignAIArtifactsJob,
    generate_embedding_skills: AdminJobs::GenerateEmbeddingSkillsJob,
    import_external_scoring_data: AdminJobs::ImportExternalScoringData,
    campaign_report_extract_and_upload_bulk_assets: AdminJobs::CampaignReportExtractAndUploadZipBulkAssets,
    generate_transcription: AdminJobs::GenerateTranscriptionJob,
    project_completion_status_export: AdminJobs::ProjectCompletionStatusExport,
    project_compact_completion_status_export: AdminJobs::ProjectCompactCompletionStatusExport,
    export_campaign_ai_artifacts_results: AdminJobs::ExportCampaignAIArtifactsResultsJob,
    export_campaign_datasheet: AdminJobs::ExportCampaignDatasheet,
    rescore_ai_scoring: AdminJobs::RescoreAIScoring,
    regenerate_assessment_transcriptions: AdminJobs::RegenerateAssessmentTranscriptionsJob,
    bulk_export_raw_factor_scores: AdminJobs::BulkExportRawFactorScores,
    bulk_export_norm_factor_scores: AdminJobs::BulkExportNormFactorScores,
    export_audit_logs: AdminJobs::ExportAuditLogs,
    copy_report: AdminJobs::CopyReport,
    import_client_assessors: AdminJobs::ImportClientAssessors
  }.freeze

  def perform(record, stage = nil)
    Current.user ||= record.owner
    record.update!(status: :in_progress)

    JOBS[record.operation.to_sym].call(record, stage) do
      on(:ok) do |response|
        if response
          record.complete!(response[:error_messages], response[:exception])
          record.update(response)
        else
          record.complete!
        end
      end
      on(:waiting) do |response|
        record.update(response) if response
      end
    end
  end

  class << self
    def call(operation, data, owner, file = nil)
      JOBS[operation.to_sym].validate(data, owner)
      data[:owner_country] = Current.user_country
      record = AdminJobRecord.create!(operation: operation, data: data, file: file, owner: owner)

      record.broadcast(:create)
      perform_later(record)
      record
    end

    def call_subjob(record, step)
      AdminJob.perform_later(record, step)
    end
  end
end
