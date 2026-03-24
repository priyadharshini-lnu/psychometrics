# frozen_string_literal: true

class Api::V2::Administration::Dimensions::FactorsSubFactorResource < Api::V2::Administration::BaseResource
  attributes :id, :weight, :name, :sub_factor_id, :predicate, :value, :position

  def name
    @model.sub_factor&.name
  end
end
