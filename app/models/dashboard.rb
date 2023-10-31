# frozen_string_literal: true

class Dashboard < ApplicationRecord
  audited

  include ActiveStorageAttachable
  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync

  mount_base64_uploader :image, Private::ImageUploader

  has_one_image_attachment :as_image, variants: [:icon], service: Settings.storage.private_storage_service
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :image

  def attachment_storage_path(attribute_name, filename)
    "private/projects/#{project.id}/dashboard/#{attribute_name}/#{filename}"
  end

  belongs_to :campaign
  has_one :project, through: :campaign

  after_commit :create_flat_datasheet_view, on: [:create]

  scope :power_bi_report_present, -> { where('dataset_id IS NOT NULL AND report_id IS NOT NULL') }
  scope :preview_available, ->(*) { where(enabled: true).power_bi_report_present }
  scope :auto_refressable, -> { power_bi_report_present.where.not(refresh_interval: nil) }

  def create_flat_datasheet_view
    Sheets::CreateFlatSheetView.call!(campaign.campaign_datasheet) if campaign.campaign_datasheet
  end

  def self.ransackable_scopes(_)
    %i[preview_available]
  end
end
