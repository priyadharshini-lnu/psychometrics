# frozen_string_literal: true

class DesignSetting < ApplicationRecord
  audited

  include ActiveStorageAttachable
  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync

  LOGIN_BOX_POSITIONS = %i[left auto right].freeze

  belongs_to :project

  mount_base64_uploader :logo, Public::ImageUploader
  mount_base64_uploader :background, Public::BackgroundUploader
  mount_base64_uploader :secondary_logo, Public::ImageUploader

  has_one_image_attachment :as_logo, variants: [:thumb]
  has_one_image_attachment :as_background, variants: [:thumb]
  has_one_image_attachment :as_secondary_logo, variants: [:thumb]
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :logo, :background, :secondary_logo

  def attachment_storage_path(attribute_name, filename)
    "public/projects/#{project.id}/design_setting/#{attribute_name}/#{filename}"
  end
end
