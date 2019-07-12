# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria < Base
    class ByUserFields
      private

      def user_matches_criteria?(user)
        criteria_list.all? do |criteria|
          if criteria['name_or_email']
            Comparator::String.call!(user.decorate.full_name, criteria['value'], criteria['comparator']) ||
              Comparator::String.call!(user.email, criteria['value'], criteria['comparator'])
          else
            StringComparator.call!(user.public_send(criteria['field']), criteria['value'], ficriteriaeld['comparator'])
          end
        end
      end
    end
  end
end
