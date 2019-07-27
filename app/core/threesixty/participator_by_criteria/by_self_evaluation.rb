# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class BySelfEvaluation < Base
      private

      def user_matches_criteria?(user, criteria)
        return criteria['value'] == 'completed' if users_results.include?(user.id)

        criteria['value'] == 'not_completed'
      end

      def users_results
        @users_results ||= threesixty_campaign.
                           users_results.
                           completed.
                           where('subject_id = evaluator_id').
                           where(subject_id: user_ids).
                           pluck(:subject_id).
                           to_set
      end
    end
  end
end
