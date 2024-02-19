# frozen_string_literal: true

class InnovationStyleSerializer < Panko::Serializer
  attributes :id, :name, :description, :full_description, :icon, :factors, :position

  def factors
    Panko::ArraySerializer.new(
      object.innovation_styles_factors,
      each_serializer: InnovationStylesFactorSerializer
    ).to_a
  end

  def icon
    object.icon.url
  end
end
