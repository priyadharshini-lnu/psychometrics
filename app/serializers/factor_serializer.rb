# frozen_string_literal: true

class FactorSerializer < Panko::Serializer
  attributes :id, :name, :code, :description, :icon, :scoring_strategy, :use_percentage, :use_sub_factor_norm_score,
             :external_scoring, :scale_min, :scale_max, :custom_formula

  has_many :factors_sub_factors, each_serializer: FactorsSubFactorSerializer, key: :factors_sub_factors

  def icon
    object.icon_url(:medium) if object.icon.attached?
  end
end
