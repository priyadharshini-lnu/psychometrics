# frozen_string_literal: true

class Api::V2::Administration::FactorsNormResource < Api::V2::Administration::BaseResource
  attributes :factor_id, :name, :norm_id, :props

  has_one :factor, class_name: 'Factor'

  delegate :name, to: :factor
end
