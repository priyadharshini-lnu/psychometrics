# frozen_string_literal: true

module Threesixty
  module Subjects
    class GetEvaluationsReceived < BaseCommand
      private_attr_reader :threesixty_campaign, :user_ids

      def initialize(threesixty_campaign, user_ids)
        @threesixty_campaign = threesixty_campaign
        @user_ids = user_ids
      end

      def call
        evaluations_recieved_by_relationship = Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          user_ids,
          threesixty_campaign,
          [:completed]
        )

        evaluations_received = evaluations_recieved_by_relationship.transform_values do |acc|
          acc[:completed]&.values&.sum || 0
        end

        broadcast :ok, evaluations_received
      end
    end
  end
end
