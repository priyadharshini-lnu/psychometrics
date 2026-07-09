# frozen_string_literal: true

class OccupationsFactor < ApplicationRecord
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

  belongs_to :factor
  belongs_to :occupation
  belongs_to :occupation_condition_set
  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :factor

  default_scope { order('position asc NULLS LAST') }

  validates :factor, :predicate, :value, :occupation_condition_set, presence: true
  validates :predicate, inclusion: { in: CONDITION_MAP.keys.map(&:to_s) }
  validates :value, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :position, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  def log_attribute_for_delete
    slice(:factor_id, :occupation_id)
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id]
  end

  def self.ransackable_associations(_auth_object = nil)
    %w[factor]
  end
end
