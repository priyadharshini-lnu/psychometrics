module Assessments
  class FactorSerializer < ActiveModel::Serializer
    type :factor
    attributes :id, :name, :parent_id, :scoring, :description, :icon

    def icon
      object.icon.url(:middle)
    end

    def scoring
      @instance_options[:factor_scoring] || []
    end
  end
end
