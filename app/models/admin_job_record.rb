# frozen_string_literal: true

class AdminJobRecord < ApplicationRecord
  self.table_name = 'admin_jobs'

  belongs_to :owner, class_name: 'User', foreign_key: :owner_id

  mount_uploader :file, FileUploader

  enum operation: {
    import_users: 0,
    rescore_assessment: 1,
    import_raw_data: 2,
    import_scoring_data: 3,
    bulk_reports: 4,
    regenerate_campaign_reports: 5,
    regenerate_report: 6
  }

  enum status: { scheduled: 0, in_progress: 1, completed: 2 }
end
