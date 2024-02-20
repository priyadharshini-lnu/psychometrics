# frozen_string_literal: true

module Administration
  module Campaigns
    module WorkshopSubjects
      class CampaignAssessorAssessmentSerializer < Panko::Serializer
        attributes :id, :name, :assessor_user_assessment_id, :status, :schedule_time, :meeting_link,
                   :linked_activity, :assessor, :subject_linked_activity_present, :meeting_type

        delegate :name, to: :assessment, allow_nil: true
        delegate :status, :schedule_time, to: :assessor_user_assessment, allow_nil: true
        delegate :id, to: :assessor_user_assessment, prefix: true, allow_nil: true
        delegate :meeting_type, to: :subject_user_assessment, allow_nil: true

        def id
          object.id.to_s
        end

        def assessor
          return unless assessor_user_assessment

          {
            id: assessor_user_assessment.evaluator&.id.to_s,
            name: assessor_user_assessment.evaluator&.name,
            photo_url: assessor_user_assessment.evaluator&.photo_url
          }
        end

        def linked_activity
          object.assessment.linked_assessment&.name
        end

        def subject_linked_activity_present
          subject_user_assessment.present?
        end

        def meeting_link
          subject_user_assessment&.real_meeting_link(current_user)
        end

        private

        def assessment
          object.assessment
        end

        def subject_user_assessment
          subject_user_assessments[object.assessment&.linked_assessment_id || assessor_user_assessment&.evaluator_id]
        end

        def subject_user_assessments
          context[:subject_user_assessments]
        end

        def assessor_user_assessments
          context[:assessor_user_assessments]
        end

        def assessor_user_assessment
          assessor_user_assessments[object.assessment_id]
        end

        def current_user
          context[:current_user]
        end
      end
    end
  end
end
