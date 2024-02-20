# frozen_string_literal: true

class InnovationStyle < ApplicationRecord
  audited

  include RansackSearchableFields
  include ActiveStorageAttachable
  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync

  has_many :innovation_styles_factors, dependent: :destroy
  belongs_to :dimension

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  validates :position, numericality: { only_integer: true }, allow_nil: true

  mount_uploader :icon, Public::ImageUploader

  has_one_image_attachment :as_icon, variants: [:icon]
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :icon

  def attachment_storage_path(attribute_name, filename)
    "public/innovation_style/#{id}/#{attribute_name}/#{filename}"
  end

  def log_attribute_for_delete
    slice(:name, :dimension_id)
  end
end
