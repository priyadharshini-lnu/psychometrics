# frozen_string_literal: true

class ProductImage < ApplicationRecord
  belongs_to :product

  validates :image, presence: true
  mount_uploader :image, Public::ImageUploader
end
