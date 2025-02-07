# frozen_string_literal: true

module EndUser
  class SystemChecksSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers
    attributes :url, :checks, :id, :config, :transcribe_supported_locales
    attributes :campaign_id

    def url
      return agile_user_assessment_path(object) if object.assessment.agile?

      return pass_user_assessment_path(object) if object.campaign.common?

      campaign_evaluation_path(object, campaign_id: object.threesixty_campaign.id)
    end

    def campaign_id
      return unless object.assessment.threesixty?

      object.campaign.threesixty_campaign.id
    end

    def transcribe_supported_locales
      Settings.checking_wizard.audio.supported_locales
    end

    def checks
      {
        video: object.assessment.extra['enable_video_check'] || has_question_type('VideoResponse'),
        audio: object.assessment.extra['enable_audio_check'] || has_question_type('AudioResponse'),
        network: object.assessment.extra['enable_network_check']
      }
    end

    def config
      {
        network: Settings.checking_wizard.network.to_h
      }
    end

    private

    def has_question_type(type)
      available_questions = object.assessment.questions.not_deleted.uniq { |q| q[:type] }

      available_questions.any? { |q| q[:type] == type }
    end
  end
end
