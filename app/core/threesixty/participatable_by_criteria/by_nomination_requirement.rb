# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class ByNominationRequirement < Base
      private

      def user_matches_criteria?(user)
        criteria_list.all? do |criteria|
          nomination_requirement_completed = Threesixty::Subjects::IsNominationRequirementComplete.call!(
            threesixty_campaign,
            user
          )

          if criteria['value'] == 'completed'
            nomination_requirement_completed
          elsif criteria['value'] == 'not_completed'
            !nomination_requirement_completed
          end
        end
      end
    end
  end
end
