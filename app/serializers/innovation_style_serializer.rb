# frozen_string_literal: true

# == Schema Information
#
# Table name: innovation_styles
#
#  id                                 :integer          not null, primary key
#  name                               :string
#  icon                               :string
#  description                        :text
#  dimension_id                       :integer
#  created_at                         :datetime         not null
#  updated_at                         :datetime         not null

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
