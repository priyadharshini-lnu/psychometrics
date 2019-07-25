# frozen_string_literal: true

module Threesixty
  module Subjects
    class IsNominationRequirementComplete < BaseCommand
      attr_reader :threesixty_campaign, :users

      def initialize(threesixty_campaign, users)
        @threesixty_campaign = threesixty_campaign
        @users = Array.wrap(users)
      end

      def call
        results = users.each_with_object({}) do |user, acc|
          next acc[user.id] = true unless nomination_requirement_by_user_id[user.id]

          acc[user.id] = Threesixty::NominationRequirements::IsValid.call!(
            nomination_requirement_by_user_id[user.id],
            subject_evaluator_counters.dig(user.id, :all)
          )
        end

        broadcast :ok, results
      end

      private

      def subject_evaluator_counters
        @subject_evaluator_counters ||= ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          users.map(&:id),
          threesixty_campaign,
          [:all]
        )
      end

      def nomination_requirement_by_user_id
        @nomination_requirement_by_user_id ||= ::Threesixty::NominationRequirements::FindForUsers.call!(
          users,
          threesixty_campaign
        )
      end
    end
  end
end
