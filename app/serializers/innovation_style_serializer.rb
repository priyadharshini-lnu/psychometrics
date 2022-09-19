# frozen_string_literal: true

class InnovationStyleSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :full_description, :icon, :factors, :position

  def factors
    object.innovation_styles_factors.map do |obj|
      InnovationStylesFactorSerializer.new(obj)
    end
  end

  def icon
    object.icon.url
  end
end
