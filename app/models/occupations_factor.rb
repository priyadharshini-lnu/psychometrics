# frozen_string_literal: true

# == Schema Information
#
# Table name: occupations_factors
#
#  id            :integer          not null, primary key
#  occupation_id :integer
#  factor_id     :integer
#  predicate     :string
#  value         :float
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  position      :integer
#

class OccupationsFactor < ApplicationRecord
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

  default_scope { order('position asc NULLS LAST') }

  validates :predicate, :value, presence: true
  validates :predicate, inclusion: { in: CONDITION_MAP.keys.map(&:to_s) }
  validates :value, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }, allow_nil: true
  validates :position, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
end
