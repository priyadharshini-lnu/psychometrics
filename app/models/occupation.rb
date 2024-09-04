# frozen_string_literal: true

class Occupation < ApplicationRecord
  audited

  include RansackSearchableFields
  include ActiveStorageAttachable

  has_many :occupations_factors, dependent: :destroy
  belongs_to :dimension

  validates :name, presence: true, length: { maximum: 150 }, allow_blank: true

  has_one_image_attachment :icon, variants: [:icon]
  has_one_image_attachment :alternative_icon, variants: [:icon]
  has_one_image_attachment :indicative_roles_image, variants: [:icon]
  has_one_image_attachment :key_career_tracks_image, variants: [:icon]

  def attachment_storage_path(attribute_name, filename)
    "public/occupation/#{id}/#{attribute_name}/#{filename}"
  end

  def log_attribute_for_delete
    slice(:name, :dimension_id)
  end
end
