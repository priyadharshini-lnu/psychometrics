# frozen_string_literal: true

module Assessments
  class FactorSerializer < Panko::Serializer
    attributes :id, :name, :parent_id, :scoring, :description, :icon, :scoring_strategy

    def icon
      object.icon_url(:medium)
    end

    def scoring
      context[:factors_scoring][object.id] || []
    end
  end
end
