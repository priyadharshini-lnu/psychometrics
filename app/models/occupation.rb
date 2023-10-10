# frozen_string_literal: true

class Occupation < ApplicationRecord
  audited

  include RansackSearchableFields
  include ActiveStorageAttachable
  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync

  has_many :occupations_factors, dependent: :destroy
  belongs_to :dimension

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  mount_uploader :alternative_icon, Public::ImageUploader
  mount_uploader :icon, Public::ImageUploader
  mount_uploader :indicative_roles_image, Public::ImageUploader
  mount_uploader :key_career_tracks_image, Public::ImageUploader

  has_one_image_attachment :as_icon, variants: [:icon]
  has_one_image_attachment :as_alternative_icon, variants: [:icon]
  has_one_image_attachment :as_indicative_roles_image, variants: [:icon]
  has_one_image_attachment :as_key_career_tracks_image, variants: [:icon]
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :alternative_icon, :icon, :indicative_roles_image, :key_career_tracks_image

  def attachment_storage_path(attribute_name, filename)
    "public/occupation/#{attribute_name}/#{filename}"
  end

  def log_attribute_for_delete
    slice(:name, :dimension_id)
  end
end
