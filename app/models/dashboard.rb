# frozen_string_literal: true

class Dashboard < ApplicationRecord
  include GeoFilterable

  audited

  include ActiveStorageAttachable

  enum :dashboard_type, { powerbi: 0, oracle_analytics: 1 }
  enum :visual_header_visibility, { hide_all: 0, show_all: 1, keep_original: 2 }

  has_one_image_attachment :image, variants: [:thumb], service: Settings.storage.private_storage_service

  def attachment_storage_path(attribute_name, filename)
    "private/projects/#{project.id}/dashboard/#{id}/#{attribute_name}/#{filename}"
  end

  belongs_to :campaign
  include Tenantable

  has_one :project, through: :campaign

  scope :power_bi_report_present, -> { where('dataset_id IS NOT NULL AND report_id IS NOT NULL') }
  scope :oracle_analytics_report_present, lambda {
    where(dashboard_type: :oracle_analytics).where.not(project_path: nil)
  }
  scope :report_available, -> { power_bi_report_present.or(oracle_analytics_report_present) }
  scope :preview_available, ->(*) { where(enabled: true).report_available }
  scope :auto_refressable, -> { power_bi_report_present.where.not(refresh_interval: nil) }

  def self.ransackable_scopes(_)
    %i[preview_available]
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name campaign_id]
  end

  def self.scoped_by_client(restricted_client_subquery)
    return all if restricted_client_subquery.blank?

    joins(:project).
      where.not(clients: { tte_id: restricted_client_subquery })
  end
end
