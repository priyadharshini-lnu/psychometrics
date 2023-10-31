# frozen_string_literal: true

class UserProfile < ApplicationRecord
  audited

  include ActiveStorageAttachable
  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync

  PROFILE_FIELDS = %i[age photo gender locale custom_fields].freeze

  enum gender: { male: 0, female: 1, not_disclosed: 2 }

  before_save :set_age_updated_at, if: :age_changed?

  belongs_to :user

  mount_uploader :photo, Public::ImageUploader

  has_one_image_attachment :as_photo, variants: [:icon]
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :photo

  def attachment_storage_path(attribute_name, filename)
    "public/user_profile/#{attribute_name}/#{filename}"
  end

  def set_age_updated_at
    self.age_updated_at = Time.current
  end
end
