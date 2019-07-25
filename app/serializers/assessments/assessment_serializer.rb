module Assessments
  class AssessmentSerializer < ActiveModel::Serializer
    attributes :id, :name, :category, :disabled, :created_at,
               :flow, :norm_rules, :factors, :enable_back, :enable_progress, :question_recoding

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
      factor_scoring = FactorsScoring.where(assessment_id: object.id).group_by(&:factor_id)
      object.dimension.all_factors.map do |factor|
        Assessments::FactorSerializer.new(factor, assessment_id: object.id, factor_scoring: factor_scoring[factor.id]).to_hash
      end
    end

    def question_recoding
      QuestionRecoding.where(assessment: object)
    end
  end
end
