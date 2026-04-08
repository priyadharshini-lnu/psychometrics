# frozen_string_literal: true

module SystemCheckSessions
  class MinimumSpeedCalculator < BaseCommand
    SPEEDS = {
      base: { upload: 1, download: 1 },
      audio: { upload: 2, download: 1 },
      video: { upload: 5, download: 1 },
      proctored: { upload: 3, download: 2 },
      proctored_video: { upload: 8, download: 3 }
    }.freeze

    BASE_SPEED = SPEEDS[:base]

    private_attr_reader :campaign_user, :campaign

    def initialize(campaign_user: nil, campaign: nil)
      @campaign_user = campaign_user
      @campaign = campaign_user&.campaign || campaign
    end

    def call
      speeds = calculate_minimum_speeds
      broadcast :ok, speeds
    end

    private

    def calculate_minimum_speeds
      if proctored?
        has_video_questions? ? SPEEDS[:proctored_video] : SPEEDS[:proctored]
      elsif has_video_questions?
        SPEEDS[:video]
      elsif has_audio_questions?
        SPEEDS[:audio]
      else
        SPEEDS[:base]
      end
    end

    def proctored?
      campaign.proctoring_enabled?
    end

    def has_video_questions?
      user_question_types.include?('VideoResponse')
    end

    def has_audio_questions?
      user_question_types.include?('AudioResponse')
    end

    def user_question_types
      @user_question_types ||= if campaign_user.present?
                                 campaign_user.user.
                                   user_assessments.deemed_incomplete.where(campaign: campaign).
                                   includes(:assessment).
                                   flat_map { |ua| ua.assessment.questions.not_deleted.pluck(:type) }.
                                   uniq
                               else
                                 campaign.assessments.
                                   flat_map { |a| a.questions.not_deleted.pluck(:type) }.
                                   uniq
                               end
    end
  end
end
