# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class ByInvitation < Base
      NOT_RECEIVED = 'not_received'
      RECEIVED_AFTER = 'received_after'

      private

      def user_matches_criteria?(user, criteria)
        return !email_history_map[user.id] if criteria['sub_field'] == NOT_RECEIVED

        return false if criteria['value'].blank?

        last_sent_at = email_history_map[user.id]&.last_sent_at
        last_sent_at && last_sent_at >= criteria['value'].to_datetime
      end

      def email_history_map
        @email_history_map ||= Threesixty::ReminderHistory.
          where(
            threesixty_campaign: threesixty_campaign,
            email_name: email_name,
            user_id: participators.map(&:user_id)
          ).
          index_by(&:user_id)
      end
    end
  end
end
