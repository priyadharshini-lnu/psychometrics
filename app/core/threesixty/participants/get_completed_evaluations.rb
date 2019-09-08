# frozen_string_literal: true

module Threesixty
  module Participants
    class GetCompletedEvaluations < BaseCommand
      private_attr_reader :user_ids, :option, :threesixty_campaign, :exclude_self_evaluations

      def initialize(threesixty_campaign, user_ids, exclude_self_evaluations: false)
        @threesixty_campaign = threesixty_campaign
        @user_ids = user_ids
        @option = threesixty_campaign.option
        @exclude_self_evaluations = exclude_self_evaluations
      end

      def call
        user_results =
          threesixty_campaign.
          users_results.
          completed.
          actual_by_options(option).
          where(evaluator_id: user_ids).
          group(:evaluator_id).
          select('evaluator_id, count(users_results.id) as completed_evaluations_count')

        user_results = user_results.where('subject_id != evaluator_id') if exclude_self_evaluations

        broadcast :ok, user_results.index_by(&:evaluator_id)
      end
    end
  end
end
