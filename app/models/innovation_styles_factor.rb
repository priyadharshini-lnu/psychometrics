# frozen_string_literal: true

class InnovationStylesFactor < ApplicationRecord
  audited

  include RansackSearchableFields

  # Roles constant
  CONDITION_MAP = {
    equal_to: '==',
    not_equal_to: '!=',
    less_then: '<',
    less_then_or_equal: '<=',
    greater_then: '>',
    greater_then_or_equal: '>='
  }.freeze

  belongs_to :innovation_style
  belongs_to :factor
  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :innovation_style

  default_scope { order('position asc NULLS LAST') }

  validates :predicate, :value, presence: true
  validates :predicate, inclusion: { in: CONDITION_MAP.keys.map(&:to_s) }
  validates :value, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }, allow_nil: true
  validates :position, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  def log_attribute_for_delete
    slice(:innovation_style_id, :factor_id, :predicate, :value)
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name predicate position weight created_at updated_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[factor]
  end
end
