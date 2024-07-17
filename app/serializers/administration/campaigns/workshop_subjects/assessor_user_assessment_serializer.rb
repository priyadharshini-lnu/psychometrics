# frozen_string_literal: true

module Administration
  module Campaigns
    module WorkshopSubjects
      class AssessorUserAssessmentSerializer < Panko::Serializer
        attributes :id, :name, :status, :schedule_time, :meeting_link,
                   :assessor, :meeting_type, :assessment_id, :linked_activity_id

        delegate :name, to: :assessment, allow_nil: true
        delegate :id, to: :assessment, prefix: true, allow_nil: true
        delegate :meeting_type, to: :subject_user_assessment, allow_nil: true

        def id
          object.id.to_s
        end

        def assessor
          {
            id: object.evaluator&.id.to_s,
            user_id: object.evaluator&.id.to_s,
            name: object.evaluator&.name,
            photo_url: object.evaluator&.photo_url
          }
        end

        def linked_activity_id
          assessment.linked_assessment_id.to_s
        end

        def meeting_link
          subject_user_assessment&.real_meeting_link(current_user)
        end

        private

        def subject_user_assessment
          UserAssessment.find_by(
            relationship_id: Relationship.self_relationship.id,
            evaluator_id: object.subject_id,
            subject_id: object.subject_id,
            campaign_id: object.campaign_id,
            assessment_id: assessment.linked_assessment_id
          )
        end

        def assessment
          object.assessment
        end

        def current_user
          context[:current_user]
        end
      end
    end
  end
end
