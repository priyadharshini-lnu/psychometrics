module Assessments
  class AssessmentSerializer < ActiveModel::Serializer
    attributes :id, :name, :category, :disabled, :created_at, :flow, :norm_rules, :factors

    has_many :blocks, serializer: Assessments::BlockSerializer do
      object.blocks.
        selecting { ['blocks.*',
                     coalesce(template.props, props).as('props'),
                     coalesce(template.name, name).as('name')] }.
        joining { template.outer }.
        includes(questions_ams: :comments).
        where.has { (template.disabled == false) | (template.id == nil) }
    end

    def factors
      factors = (object.dimension&.factors&.includes(:sub_factors) || []).map do |factor|
        result = []
        result << Assessments::FactorSerializer.new(factor, assessment_id: object.id).to_hash
        factor.sub_factors.map do |sub_factor|
          result << Assessments::FactorSerializer.new(sub_factor, assessment_id: object.id).to_hash
        end
        result
      end
      factors.flatten
    end
  end
end
