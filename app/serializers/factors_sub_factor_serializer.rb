# frozen_string_literal: true

class FactorsSubFactorSerializer < ActiveModel::Serializer
  attributes :id, :weight, :name, :sub_factor_id

  def name
    object.sub_factor.name
  end
end
