# == Schema Information
#
# Table name: factors_norms
#
#  id        :integer          not null, primary key
#  type      :enum
#  factor_id :integer
#  norm_id   :integer
#  props     :json
#
class OccupationsFactor < ApplicationRecord
  belongs_to :factor
  belongs_to :occupation

  validates :predicate, :value, :factor, presence: true
  validates :value, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }, allow_nil: true

  # Roles constant
  CONDITION_MAP = {
      less_then: '<',
      less_then_or_equal: '<=',
      greater_then: '>',
      greater_then_or_equal: '>='
  }.freeze
end
