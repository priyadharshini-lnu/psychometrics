# frozen_string_literal: true

module SystemCheckSessions
  class RequirementsCalculator < BaseCommand
    SPEED_CHECK_QUESTION_TYPES = %w[AudioResponse VideoResponse FileUpload].freeze

    private_attr_reader :campaign_user

    def initialize(campaign_user)
      @campaign_user = campaign_user
    end

    def call
      requirements = {
        browser: browser_requirements,
        network: network_requirements,
        video: video_requirements,
        audio: audio_requirements
      }

      broadcast :ok, requirements
    end

    private

    def browser_requirements
      { required: true }
    end

    def network_requirements
      {
        required: requires_internet_speed_check?,
        minimum_download_speed: minimum_download_speed,
        minimum_upload_speed: minimum_upload_speed
      }
    end

    def minimum_download_speed
      campaign.minimum_download_speed ||
        campaign.calculated_minimum_download_speed(campaign_user)
    end

    def minimum_upload_speed
      campaign.minimum_upload_speed ||
        campaign.calculated_minimum_upload_speed(campaign_user)
    end

    def requires_internet_speed_check?
      user_question_types.intersect?(SPEED_CHECK_QUESTION_TYPES)
    end

    def video_requirements
      {
        required: has_video_questions?,
        face_detection_enabled: campaign.face_detection_enabled?,
        minimum_face_detection_ratio: campaign.minimum_face_detection_ratio,
        phrase_verification_enabled: campaign.phrase_verification_enabled?
      }
    end

    def audio_requirements
      {
        required: has_audio_questions? && !has_video_questions?,
        phrase_verification_enabled: campaign.phrase_verification_enabled?
      }
    end

    def has_video_questions?
      user_question_types.include?('VideoResponse')
    end

    def has_audio_questions?
      user_question_types.include?('AudioResponse')
    end

    def user_question_types
      @user_question_types ||= campaign_user.user.
                               user_assessments.deemed_incomplete.where(campaign: campaign).
                               includes(:assessment).
                               flat_map { |ua| ua.assessment.questions.not_deleted.pluck(:type) }.
                               uniq
    end

    def campaign
      @campaign ||= campaign_user.campaign
    end
  end
end
