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
                           joins(:user_assessment).
                           completed.
                           where('user_assessments.subject_id = user_assessments.evaluator_id').
                           where(user_assessments: { subject_id: user_ids }).
                           pluck('user_assessments.subject_id').
                           to_set
      end
    end
  end
end
