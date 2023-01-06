# frozen_string_literal: true

class InnovationStyle < ApplicationRecord
  include RansackSearchableFields

  has_many :innovation_styles_factors, dependent: :destroy
  belongs_to :dimension

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  validates :position, numericality: { only_integer: true }, allow_nil: true

  mount_uploader :icon, Public::ImageUploader

  def log_attribute_for_delete
    slice(:name, :dimension_id)
  end
end
