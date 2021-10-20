# frozen_string_literal: true

module Campaigns
  module Proctoring
    class GetProctoringCredits < BaseCommand
      private_attr_reader :campaign

      MIN_CREDIT = 3
      SECS_IN_MIN = 60
      MINUTES_STEP = 15

      def initialize(campaign)
        @campaign = campaign
      end

      def call
        time = campaign.campaign_options.fixed_time_duration
        return unless time

        credits = MIN_CREDIT + mins_to_credits(time / SECS_IN_MIN)
        broadcast(:ok, credits)
      end

      def mins_to_credits(mins)
        mins < MINUTES_STEP ? 0 : ((mins - MINUTES_STEP) / MINUTES_STEP.to_f).ceil
      end
    end
  end
end
