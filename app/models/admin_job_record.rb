# frozen_string_literal: true

class AdminJobRecord < ApplicationRecord
  audited

  self.table_name = 'admin_jobs'

  include ActiveStorageAttachable

  belongs_to :owner, class_name: 'User'
  has_one :data_report_job

  has_one_attachment :file, service: Settings.storage.private_storage_service

  validates :file, content_type: %w[csv xlsx xls zip json]

  def attachment_storage_path(attribute_name, filename)
    "private/admin_job/#{id}/#{attribute_name}/#{filename}"
  end

  enum :operation, {
    import_users: 0,
    rescore_assessment: 1,
    rescore_user_assessment: 2,
    import_raw_data: 3,
    import_scoring_data: 4,
    bulk_download_reports: 5,
    bulk_regenerate_reports: 6,
    bulk_regenerate_user_reports: 7,
    import_assessors: 8,
    import_datasheet: 9,
    copy_dimension: 10,
    export_report_data: 11,
    assessment_raw_result_export: 12,
    assessment_scoring_export: 13,
    assessment_norm_export: 14,
    assessment_raw_factor_export: 15,
    external_assessment_export: 16,
    import_sms_invites: 17,
    send_sms_invites: 18,
    completion_status_export: 19,
    threesixty_campaign_export_completion_status: 20,
    compact_completion_status_export: 21,
    export_users: 22,
    import_accesssheet: 23,
    import_question_translations: 24,
    bulk_regenerate_threesixty_reports: 25,
    regenerate_threesixty_report: 26,
    bulk_create_workshop_invites: 27,
    super_admin_assessment_raw_result_export: 28,
    super_admin_assessment_raw_factor_export: 29,
    workshop_status_export: 30,
    bulk_rescore_campaign_factors: 31,
    import_assessment_questions: 32,
    assign_reports_and_assessments: 33,
    export_campaign_scorings: 34,
    export_reports_and_assessments: 35,
    super_admin_assessment_norm_export: 36,
    super_admin_datasheet_export: 37,
    super_admin_external_assessment_export: 38,
    export_admin_with_permissions: 39,
    bulk_download_user_reports: 40,
    export_campaign_factors: 41,
    import_campaign_factors: 42,
    create_threesixty_campaign: 43,
    remap_report_assessment: 44,
    threesixty_campaign_export_scores: 45,
    import_external_campaign_scoring: 46,
    export_factor_translations: 47,
    import_factor_translations: 48,
    normalize_factor_scores: 49,
    export_occupations: 50,
    export_user_report_events: 51,
    migrate_assessment_translations: 52,
    add_campaign_reports: 53,
    import_skills: 54,
    assign_idp_to_users: 55,
    data_report_export: 56,
    import_development_actions: 57,
    export_development_actions: 58,
    import_factors: 59,
    import_development_action_translations: 60,
    export_development_action_translations: 61,
    export_norm: 62,
    import_norm: 63,
    export_dimension_as_json: 64,
    import_dimension_from_json: 65,
    export_assessment_questions: 66,
    export_skill_translations: 67,
    import_skill_translations: 68,
    export_skills: 69,
    bulk_update_evaluation_status: 70
  }

  enum :status, { scheduled: 0, in_progress: 1, completed: 2, failed: 3 }

  after_commit -> { broadcast(:update) }, if: proc { status_previously_changed? || completed_tasks_previously_changed? }

  def progress
    return 100 if completed? || total_tasks.zero?

    (completed_tasks / total_tasks.to_f * 100).floor
  end

  def increment_completed_tasks!
    return if completed_tasks == total_tasks

    with_lock do
      self.completed_tasks = completed_tasks + 1
      self.status = :completed if completed_tasks == total_tasks
      save!
    end
  end

  def complete!(error_messages = [], exception = nil)
    return if completed?

    update!(status: :completed, completed_tasks: total_tasks, error_messages: error_messages, exception: exception)
  end

  def broadcast(action)
    AdminJobChannel.broadcast_to(owner, action: action, job: AdminJobRecordSerializer.new.serialize(self))
  end

  def job_operation_instance
    @job_operation_instance ||= AdminJob::JOBS[operation.to_sym].new(self)
  end
end
