# frozen_string_literal: true

module Communications
  module ReminderType
    class NotCompletedJob < NotStartedJob
      private

      def fetch_campaign_users(communication)
        communication.campaign_users_not_recently_invited.where.not(completion_status: :completed)
      end
    end
  end
end
