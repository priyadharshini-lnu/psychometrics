module Assessments
  class AssessmentSerializer < ActiveModel::Serializer
    attributes :id, :name, :category, :disabled, :created_at, :flow, :norm_rules, :factors, :enable_back, :enable_progress

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
      factors_scoring = object.factors_scoring.index_by(&:id)
      object.dimension.all_factors.map do |factor|
        Assessments::FactorSerializer.new(factor, assessment_id: object.id, factors_scoring: factors_scoring[factor.id] || []).to_hash
      end
    end
  end
end
