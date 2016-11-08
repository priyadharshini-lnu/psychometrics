# == Schema Information
#
# Table name: assessments
#
#  id           :integer          not null, primary key
#  name         :string
#  category     :enum             default("psychometric")
#  dimension_id :integer
#  disabled     :boolean          default(FALSE)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  flow         :json
#  norm_rules   :json
#

class AssessmentSerializer < ActiveModel::Serializer
  attributes :id, :name, :category, :disabled, :created_at, :flow, :norm_rules, :factors

  has_many :blocks, serializer: BlockSerializer do
    object.blocks.
      selecting { ['blocks.*',
                   coalesce(template.props, props).as('props'),
                   coalesce(template.name, name).as('name')] }.
      joining { template.outer }.
      includes(:questions).
      where.has { (template.disabled == false) | (template.id == nil) }
  end

  def factors
    factors = object.dimension.factors.includes(:sub_factors).map do |factor|
      result = []
      result << Factors::WithoutSubFactorsSerializer.new(factor).to_hash
      factor.sub_factors.map do |sub_factor|
        result << Factors::WithoutSubFactorsSerializer.new(sub_factor).to_hash
      end
      result
    end
    factors.flatten
  end
end
