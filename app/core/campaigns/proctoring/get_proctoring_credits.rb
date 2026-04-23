# frozen_string_literal: true

module Campaigns
  module Proctoring
    class GetProctoringCredits < BaseCommand
      private_attr_reader :campaign, :user_assessment

      MIN_CREDIT = 3
      SECS_IN_MIN = 60
      MINUTES_STEP = 15
      BASE_BUFFER_MINUTES = 5
      SYSTEM_CHECK_BUFFER_MINUTES = 10
      SYSTEM_CHECK_KEYS = %w[enable_video_check enable_audio_check enable_network_check].freeze
      SYSTEM_CHECK_QUESTION_TYPES = %w[VideoResponse AudioResponse].freeze

      def initialize(campaign, user_assessment = nil)
        @campaign = campaign
        @user_assessment = user_assessment
      end

      def call
        if campaign.selective_proctoring_enabled?
          return unless user_assessment

          buffer_time = buffer_time_minutes(user_assessment.assessment)
          total_seconds = user_assessment.assessment.extra&.[]('timer').to_i + (buffer_time * SECS_IN_MIN)
          credits = MIN_CREDIT + mins_to_credits(total_seconds / SECS_IN_MIN)
        else
          time = campaign.campaign_options.fixed_time_duration
          return unless time

          credits = MIN_CREDIT + mins_to_credits(time / SECS_IN_MIN)
        end

        broadcast(:ok, credits)
      end

      def mins_to_credits(mins)
        mins < MINUTES_STEP ? 0 : ((mins - MINUTES_STEP) / MINUTES_STEP.to_f).ceil
      end

      private

      def buffer_time_minutes(assessment)
        buffer_time = BASE_BUFFER_MINUTES
        buffer_time += SYSTEM_CHECK_BUFFER_MINUTES if assessment_requires_system_checks?(assessment)
        buffer_time
      end

      def assessment_requires_system_checks?(assessment)
        SYSTEM_CHECK_KEYS.any? { |check| [true, 'true'].include?(assessment.extra&.[](check)) } ||
          assessment.questions.not_deleted.exists?(type: SYSTEM_CHECK_QUESTION_TYPES)
      end
    end
  end
end
