# frozen_string_literal: true

module Communications
  module ReminderType
    class InProgressJob < NotStartedJob
      private

      def fetch_campaign_users(communication)
        communication.campaign_users_not_recently_invited.where(completion_status: :in_progress)
      end
    end
  end
end
