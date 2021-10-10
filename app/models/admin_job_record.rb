# frozen_string_literal: true

class AdminJobRecord < ApplicationRecord
  self.table_name = 'admin_jobs'

  belongs_to :owner, class_name: 'User', foreign_key: :owner_id

  mount_uploader :file, FileUploader

  enum operation: {
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
    send_sms_invites: 18
  }

  enum status: { scheduled: 0, in_progress: 1, completed: 2 }

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
    broadcast(:update)
  end

  def complete!(error_messages = [])
    return if completed?

    update!(status: :completed, completed_tasks: total_tasks, error_messages: error_messages)
    broadcast(:update)
  end

  def broadcast(action)
    AdminJobChannel.broadcast_to(owner, action: action, job: AdminJobRecordSerializer.new(self))
  end
end
