# frozen_string_literal: true

class InnovationStyle < ApplicationRecord
  audited

  include RansackSearchableFields
  include ActiveStorageAttachable

  has_many :innovation_styles_factors, dependent: :destroy
  belongs_to :dimension

  validates :name, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true
  validates :position, numericality: { only_integer: true }, allow_nil: true

  has_one_image_attachment :icon, variants: [:icon]
  include Tenantable

  tenant_source :dimension

  def attachment_storage_path(attribute_name, filename)
    "public/innovation_style/#{id}/#{attribute_name}/#{filename}"
  end

  def log_attribute_for_delete
    slice(:name, :dimension_id)
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name position created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[dimension]
  end
end
