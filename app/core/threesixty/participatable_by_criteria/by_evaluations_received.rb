# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class ByEvaluationsReceived < Base
      private

      def user_matches_criteria?(user)
        criteria_list.all? do |criteria|
          Comparator::Number.call!(evaluations_received[user.id], criteria['value'], criteria['comparator'])
        end
      end

      def evaluations_received
        @evaluations_received || =Threesixty::Subjects::GetEvaluationsReceived.call!(threesixty_campaign, user_ids)
      end
    end
  end
end
