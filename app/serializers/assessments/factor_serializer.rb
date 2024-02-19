# frozen_string_literal: true

module Assessments
  class FactorSerializer < Panko::Serializer
    attributes :id, :name, :parent_id, :scoring, :description, :icon

    def icon
      object.icon.url(:middle)
    end

    def scoring
      context[:factors_scoring]
    end
  end
end
