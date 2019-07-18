# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class ByEvaluatorType < Base
      EXTERNAL = 'external'
      NOT_EXTERNAL = 'not_external'

      private

      def user_matches_criteria?(user, criteria)
        if criteria['value'] == EXTERNAL
          !user_is_subject?(user)
        elsif criteria['value'] == NOT_EXTERNAL
          user_is_subject?(user)
        end
      end

      def user_is_subject?(user)
        subject_ids.include?(user.id)
      end

      def subject_ids
        @subject_ids = threesixty_campaign.subjects.pluck(:user_id).to_set
      end
    end
  end
end
