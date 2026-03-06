# frozen_string_literal: true

module Assessments
  class FactorSerializer < Panko::Serializer
    attributes :id, :name, :parent_id, :scoring, :description, :icon, :scoring_strategy, :factor_type, :score_min,
               :score_max, :what_to_look_for, :score_definitions, :sub_factor_ids, :child_factor_type

    def icon
      object.icon_url(:medium)
    end

    def scoring
      context[:factors_scoring][object.id] || []
    end
  end
end
