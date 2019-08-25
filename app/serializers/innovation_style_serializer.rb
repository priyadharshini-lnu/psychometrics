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

class OccupationSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :icon

  def factors
    object.innovation_styles_factors.map do |obj|
      InnovationStylesFactorSerializer.new(obj)
    end
  end

  def icon
    object.icon.url
  end
end
