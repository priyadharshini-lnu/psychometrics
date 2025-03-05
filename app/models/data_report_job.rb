# frozen_string_literal: true

class DataReportJob < ApplicationRecord
  belongs_to :data_report
  belongs_to :created_by, class_name: 'User'
  belongs_to :admin_job_record, dependent: :destroy

  enum :status, { in_progress: 0, completed: 1, completed_with_errors: 2 }

  before_create :create_password

  include ActiveStorageAttachable

  has_one_attachment :file, service: Settings.storage.private_storage_service
  validates :file, content_type: %w[zip]

  def attachment_storage_path(attribute_name, filename)
    "private/data_reports/#{id}/#{attribute_name}/#{filename}"
  end

  def create_password
    self.password = ::Utility::String.generate_strong_password(12)
  end
end
