# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class ByInvitation < Base
      NOT_RECEIVED = 'not_received'
      RECEIVED_AFTER = 'received_after'

      private

      def user_matches_criteria?(user, criteria)
        return false if criteria['sub_field'] == NOT_RECEIVED

        return false if criteria['value'].blank?

        participator_map[user.id].created_at >= criteria['value'].to_datetime
      end

      def participator_map
        @participator_map ||= participators.index_by(&:user_id)
      end
    end
  end
end
