# frozen_string_literal: true

module Threesixty
  module Participants
    class GetCompletedEvaluations < BaseCommand
      def initialize(threesixty_campaign, user_ids)
        @threesixty_campaign = threesixty_campaign
        @user_ids = user_ids
        @option = threesixty_campaign.option
      end

      def call
        user_results =
          threesixty_campaign.
            users_results.
            completed.
            actual_by_options(option).
            where(evaluator_id: user_ids).
            group(:evaluator_id).
            select('evaluator_id, count(users_results.id) as completed_evaluations_count').
            index_by(&:evaluator_id)

        broadcast :ok, user_results
      end

      private

      attr_reader :user_ids, :option, :threesixty_campaign
    end
  end
end
