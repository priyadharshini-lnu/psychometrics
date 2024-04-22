# frozen_string_literal: true

module Administration
  class ShortAssessorAssessmentSerializer < Panko::Serializer
    attributes :id, :name, :status, :completed_at, :assessment_id, :linked_assessment_id,
               :allow_multiple_responses

    delegate :name, to: :assessment
    delegate :linked_assessment_id, to: :assessment
    delegate :linked_assessment, :assessment, to: :object

    def allow_multiple_responses
      campaign_assessor_assessments[object.assessment_id]&.allow_multiple_responses
    end

    private

    def campaign_assessor_assessments
      context[:campaign_assessor_assessments]
    end

    def current_user
      context[:current_user]
    end
  end
end
