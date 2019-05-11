module Reports
  class AssessmentSerializer < ActiveModel::Serializer
    attributes :id, :name, :category, :disabled, :created_at, :flow, :norm_rules, :dimension_id, :factors

    has_many :blocks, serializer: BlockSerializer do
      object.blocks.
          selecting { ['blocks.*',
                       coalesce(template.props, props).as('props'),
                       coalesce(template.name, name).as('name')] }.
          joining { template.outer }.
          includes(questions_ams: :comments).
          where.has { (template.disabled == false) | (template.id == nil) }
    end

    def factors
      if object.mindmill?
        external_assessment = Settings.providers.mindmill.assessments.detect { |a| a.id == object.mindmill_id }
        return external_assessment.factors.flatten
      end
      if object.hogan?
        external_assessment = Settings.providers.hogan.assessments.detect { |a| a.id == object.hogan_assessment_setting.hogan_assessment_id }
        return external_assessment.factors.flatten.map(&:to_h)
      end
      []
    end
  end
end
