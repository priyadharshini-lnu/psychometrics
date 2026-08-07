# frozen_string_literal: true

class DataReportJob < ApplicationRecord
  include GeoFilterable

  belongs_to :data_report
  belongs_to :created_by, class_name: 'User'
  belongs_to :admin_job_record, dependent: :destroy
  include Tenantable

  tenant_source :data_report

  enum :status, { in_progress: 0, completed: 1, completed_with_errors: 2 }

  before_create :create_password

  include ActiveStorageAttachable

  has_one_attachment :file, service: Settings.storage.private_storage_service
  validates :file, content_type: %w[zip]

  def self.scoped_by_client(restricted_client_subquery)
    return all if restricted_client_subquery.blank?

    joins(:data_report).
      where(
        'data_reports.owner_id IS NULL OR data_reports.owner_id NOT IN (?)',
        restricted_client_subquery
      )
  end

  def self.cleanup_old_jobs(older_than: 30.days.ago)
    where('created_at <= ?', older_than).destroy_all.count
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[owner_id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[data_reports]
  end

  def attachment_storage_path(attribute_name, filename)
    "private/data_reports/#{id}/#{attribute_name}/#{filename}"
  end

  def create_password
    self.password = ::Utility::String.generate_strong_password(12)
  end
end
