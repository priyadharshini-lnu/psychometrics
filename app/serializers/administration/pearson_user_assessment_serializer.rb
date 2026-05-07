# frozen_string_literal: true

module Administration
  class PearsonUserAssessmentSerializer < Panko::Serializer
    attributes :schedule_id, :norm_id, :assessment_id, :product_id

    def assessment_id
      object.user_assessment.assessment_id
    end

    def product_id
      object.user_assessment.assessment.external_settings[:assessment_id]
    end
  end
end
