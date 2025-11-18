# frozen_string_literal: true

module Administration
  class YoodliUserAssessmentSerializer < Panko::Serializer
    attributes :email, :external_assessment_id

    def external_assessment_id
      object.user_assessment.assessment.external_assessment_id.to_s
    end
  end
end
