# frozen_string_literal: true

class FactorSerializer < ActiveModel::Serializer
  attributes :id, :name, :code, :description, :icon, :scoring_strategy
  has_many :factors_sub_factors, serializer: FactorsSubFactorSerializer, key: :factors_sub_factors

  def icon
    object.icon.url(:middle)
  end
end
