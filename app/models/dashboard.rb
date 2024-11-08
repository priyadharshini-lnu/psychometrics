# frozen_string_literal: true

class Dashboard < ApplicationRecord
  audited

  include ActiveStorageAttachable

  enum :dashboard_type, { powerbi: 0, oracle_analytics: 1 }

  has_one_image_attachment :image, variants: [:thumb], service: Settings.storage.private_storage_service

  def attachment_storage_path(attribute_name, filename)
    "private/projects/#{project.id}/dashboard/#{id}/#{attribute_name}/#{filename}"
  end

  belongs_to :campaign
  has_one :project, through: :campaign

  after_commit :create_flat_datasheet_view, on: [:create]

  scope :power_bi_report_present, -> { where('dataset_id IS NOT NULL AND report_id IS NOT NULL') }
  scope :oracle_analytics_report_present, lambda {
    where(dashboard_type: :oracle_analytics).where.not(project_path: nil)
  }
  scope :report_available, -> { power_bi_report_present.or(oracle_analytics_report_present) }
  scope :preview_available, ->(*) { where(enabled: true).report_available }
  scope :auto_refressable, -> { power_bi_report_present.where.not(refresh_interval: nil) }

  def create_flat_datasheet_view
    Sheets::CreateFlatSheetView.call!(campaign.campaign_datasheet) if campaign.campaign_datasheet
  end

  def self.ransackable_scopes(_)
    %i[preview_available]
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name campaign_id]
  end
end
