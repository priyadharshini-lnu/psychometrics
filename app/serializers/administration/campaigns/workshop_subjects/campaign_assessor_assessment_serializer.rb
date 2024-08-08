# frozen_string_literal: true

module Administration
  module Campaigns
    module WorkshopSubjects
      class CampaignAssessorAssessmentSerializer < Panko::Serializer
        attributes :id, :name, :assessment_id, :linked_activity_id

        delegate :name, to: :assessment, allow_nil: true

        def linked_activity_id
          assessment.linked_assessment_id.to_s
        end

        private

        def assessment
          object.assessment
        end
      end
    end
  end
end
