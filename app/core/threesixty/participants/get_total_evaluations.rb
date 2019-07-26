# frozen_string_literal: true

module Threesixty
  module Participants
    class GetTotalEvaluations < BaseCommand
      private_attr_reader :user_ids, :option, :threesixty_campaign

      def initialize(threesixty_campaign, user_ids)
        @threesixty_campaign = threesixty_campaign
        @user_ids = user_ids
        @option = threesixty_campaign.option
      end

      def call
        participants = threesixty_campaign.
          participants.
          active.
          actual_by_options(option).
          where(evaluator_id: user_ids).
          group(:evaluator_id).
          select('evaluator_id, count(id) as total_evaluations_count')
        if option.participants.dig('manager', 'can_approve_nominations')
          participants = participants.where(manager_nomination_status: :approved)
        end

        broadcast :ok, participants.index_by(&:evaluator_id)
      end
    end
  end
end
