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
    copy_dimension: 10
  }

  enum status: { scheduled: 0, in_progress: 1, completed: 2 }
end
