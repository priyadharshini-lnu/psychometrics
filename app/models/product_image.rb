# frozen_string_literal: true

class ProductImage < ApplicationRecord
  belongs_to :product

  # TODO: remove presence validation if favor of activestorage attached: true validation
  validates :image, presence: true
  mount_uploader :image, Public::ImageUploader

  include ActiveStorageAttachable
  has_one_image_attached :as_image, variants: [:icon]

  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :image
end
