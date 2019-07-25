# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class ByNominationRequirement < Base
      private

      def user_matches_criteria?(user, criteria)
        return criteria['value'] == 'completed' if participator_type == :evaluator

        return nomination_requirements_complete[user.id] if criteria['value'] == 'completed'

        return !nomination_requirements_complete[user.id] if criteria['value'] == 'not_completed'
      end

      def nomination_requirements_complete
        @nomination_requirements_complete ||= Threesixty::Subjects::IsNominationRequirementComplete.call!(
          threesixty_campaign,
          users
        )
      end
    end
  end
end
