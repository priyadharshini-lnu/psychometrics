# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class ByUserFields < Base
      def call
        filtered_participators = participators.select do |participator|
          criteria_list.group_by { |criteria| criteria['field'] }.all? do |_criteria_name, grouped_criteria_list|
            user_matches_criteria?(participator.user, grouped_criteria_list)
          end
        end

        broadcast :ok, filtered_participators
      end

      private

      def user_matches_criteria?(user, grouped_criteria_list)
        grouped_criteria_list.any? do |criteria|
          if criteria['field'] == 'name_or_email'
            Comparator::String.call!(user.decorate.full_name, criteria['value'], criteria['comparator']) ||
              Comparator::String.call!(user.email, criteria['value'], criteria['comparator'])
          else
            Comparator::String.call!(user.public_send(criteria['field']), criteria['value'], criteria['comparator'])
          end
        end
      end
    end
  end
end
