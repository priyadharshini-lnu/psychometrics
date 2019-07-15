# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class BySelfEvaluation  < Base
      private

      def user_matches_criteria?(user)
        criteria_list.all? do |criteria|
          if criteria['value'] == 'completed'
            users_results.include?(user.id)
          elsif criteria['value'] == 'not_completed'
            users_results.exclude?(user.id)
          end
        end
      end

      def users_results
        @users_results ||= threesixty_campaign.
        users_results.
          completed.
          where("subject_id = evaluator_id")
          .pluck(:subject_id)
          .to_set
      end
    end
  end
end
