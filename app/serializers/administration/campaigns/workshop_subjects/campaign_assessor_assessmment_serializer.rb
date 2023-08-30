# frozen_string_literal: true

module Administration
  module Campaigns
    module WorkshopSubjects
      class CampaignAssessorAssessmmentSerializer < ActiveModel::Serializer
        attributes :id, :name, :user_assessment_id, :status, :schedule_time, :meeting_link, :linked_activity, :assessor

        delegate :name, to: :assessment, allow_nil: true
        delegate :status, :schedule_time, :meeting_link, to: :user_assessment, allow_nil: true
        delegate :id, to: :user_assessment, prefix: true, allow_nil: true

        def assessor
          return unless user_assessment&.evaluator

          {
            id: user_assessment.evaluator.id.to_s,
            name: user_assessment.evaluator.name,
            photo_url: user_assessment.evaluator.photo_url
          }
        end

        def linked_activity
          CampaignAssessment.find_by(
            assessor_form_id: object.assessment_id,
            campaign_id: object.campaign_id
          )&.assessment&.name
        end

        private

        def assessment
          object.assessment
        end

        def user_assessment
          user_assessments[object.assessment_id]
        end

        def user_assessments
          instance_options[:user_assessments]
        end
      end
    end
  end
end
