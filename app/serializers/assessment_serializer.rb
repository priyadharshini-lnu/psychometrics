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
  attributes :id, :name, :category, :disabled, :created_at, :flow, :norm_rules

  has_many :blocks, serializer: BlockSerializer do
    object.blocks.where(disabled: false)
    object.blocks.
      selecting { ['blocks.*',
                   coalesce(template.props, props).as('props'),
                   coalesce(template.name, name).as('name')] }.
      joining { template.outer }.
      where.has { (template.disabled == false) | (template.id == nil) }
  end
end
