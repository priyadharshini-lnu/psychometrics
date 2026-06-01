# frozen_string_literal: true

class Norm < ApplicationRecord
  audited

  include Copyable
  include RansackSearchableFields
  include OwnerValidations

  belongs_to :created_by, class_name: 'User'
  belongs_to :updated_by, class_name: 'User'
  has_many :factors_norms, dependent: :destroy
  has_many :factors, through: :factors_norms
  belongs_to :dimension
  belongs_to :owner, class_name: 'Client'

  tenant_config has_global_records: true, optional: true
  include Tenantable

  validates :name, :dimension, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true
  validates :owner, presence: true, allow_nil: true

  enum :norm_type, { five_scale: 0, percentile: 1 }

  # Search entity by word
  scope :search_query, lambda { |query|
    where('name ILIKE ?', "%#{query}%")
  }

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[dimension updated_by]
  end

  def log_attribute_for_delete
    slice(:owner_id, :dimension_id, :name)
  end

  def clone
    @cloned_item = deep_clone include: [:factors_norms]
    @cloned_item.gen_uniq_name
    @cloned_item
  end
end
