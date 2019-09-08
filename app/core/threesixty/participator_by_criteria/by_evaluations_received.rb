# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class ByEvaluationsReceived < Base
      private

      def user_matches_criteria?(user, criteria)
        return false if evaluations_received[user.id].nil? || criteria['value'].nil?

        Comparator::Number.call!(evaluations_received[user.id], criteria['value'], criteria['comparator'])
      end

      def evaluations_received
        @evaluations_received ||= Threesixty::Subjects::GetEvaluationsReceived.call!(threesixty_campaign, user_ids)
      end
    end
  end
end
