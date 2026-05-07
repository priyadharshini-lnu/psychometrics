# frozen_string_literal: true

module Administration
  class HoganUserAssessmentSerializer < Panko::Serializer
    attributes :form_id, :assessment_id

    def form_id
      object.assessment.external_settings[:form_id]
    end

    def assessment_id
      object.assessment.external_settings[:assessment_id]
    end
  end
end
