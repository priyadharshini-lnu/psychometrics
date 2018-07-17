module Reports
  class AssessmentSerializer < ActiveModel::Serializer
    attributes :id, :name, :category, :disabled, :created_at, :flow, :norm_rules, :dimension_id

    has_many :blocks, serializer: BlockSerializer do
      object.blocks.
          selecting { ['blocks.*',
                       coalesce(template.props, props).as('props'),
                       coalesce(template.name, name).as('name')] }.
          joining { template.outer }.
          includes(questions_ams: :comments).
          where.has { (template.disabled == false) | (template.id == nil) }
    end
  end
end
