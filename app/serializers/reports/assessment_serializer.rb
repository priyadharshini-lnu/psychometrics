module Reports
  class AssessmentSerializer < ActiveModel::Serializer
    attributes :id, :name, :category, :disabled, :created_at, :flow, :norm_rules, :dimension_id, :factors, :factor_scoring_counters

    has_many :blocks, serializer: BlockSerializer do
      object.blocks.
          selecting { ['blocks.*',
                       coalesce(template.props, props).as('props'),
                       coalesce(template.name, name).as('name')] }.
          joining { template.outer }.
          includes(questions_ams: :comments).
          where.has { (template.disabled == false) | (template.id == nil) }
    end

    def factor_scoring_counters
      FactorsScoring.select('count(id) as cache_counter, factor_id').
        where(assessment_id: object.id).
        group(:factor_id).
        index_by(&:factor_id).
        transform_values(&:cache_counter)
    end

    def factors
      if object.mindmill?
        external_assessment = Settings.mindmill.find { |a| a.id == object.mindmill_id }
        return external_assessment.factors.flatten
      end
      if object.hogan?
        external_assessment = Settings.hogan.find { |a| a.assessment_id == object.hogan_assessment_setting.hogan_assessment_id }
        return external_assessment.factors.flatten.map(&:to_h)
      end
      []
    end
  end
end
