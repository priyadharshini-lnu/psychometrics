# frozen_string_literal: true

class FactorsSubFactorSerializer < Panko::Serializer
  attributes :id, :weight, :name, :sub_factor_id, :predicate, :value, :position

  def name
    object.sub_factor.name
  end
end
