# frozen_string_literal: true

module Communications
  module ReminderType
    class NotCompletedJob < NotStartedJob
      private

      def fetch_campaign_users(communication)
        campaign_users = communication.campaign_users_not_recently_invited

        if communication.selected_assessments.any?
          campaign_users.where.not(id: completed_user_ids(communication.selected_assessment_ids))
        else
          campaign_users.where.not(completion_status: :completed)
        end
      end

      def completed_user_ids(assessment_ids)
        CampaignUser.
          joins(:user_assessments).
          where(user_assessments: {
            assessment_id: assessment_ids,
            status: UserAssessment::DEEMED_COMPLETED_STATUS
          }).
          group(:id).
          having('COUNT(DISTINCT user_assessments.assessment_id) = ?', assessment_ids.size).
          select(:id)
      end
    end
  end
end
