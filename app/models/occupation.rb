# frozen_string_literal: true

class Occupation < ApplicationRecord
  include RansackSearchableFields

  has_many :occupations_factors
  belongs_to :dimension

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  mount_uploader :alternative_icon, ImageUploader
  mount_uploader :icon, ImageUploader
  mount_uploader :indicative_roles_image, ImageUploader
  mount_uploader :key_career_tracks_image, ImageUploader

  def log_attribute_for_delete
    slice(:name, :dimension_id)
  end
end
