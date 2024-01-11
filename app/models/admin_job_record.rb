# frozen_string_literal: true

class AdminJobRecord < ApplicationRecord
  audited

  self.table_name = 'admin_jobs'

  include ActiveStorageAttachable
  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync

  belongs_to :owner, class_name: 'User'

  mount_uploader :file, Private::FileUploader

  has_one_attachment :as_file, service: Settings.storage.private_storage_service
  validates :as_file, content_type: %w[jpg jpeg gif png mp3 mp4 wma avi pdf svg csv xlsx xls]
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :file

  def attachment_storage_path(attribute_name, filename)
    "private/admin_job/#{id}/#{attribute_name}/#{filename}"
  end

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
    super_admin_assessment_raw_factor_export: 29
  }

  enum status: { scheduled: 0, in_progress: 1, completed: 2, failed: 3 }

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
    AdminJobChannel.broadcast_to(owner, action: action, job: AdminJobRecordSerializer.new(self))
  end
end
