# frozen_string_literal: true

module EndUser
  class SystemChecksSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers
    attributes :url, :checks, :id, :config, :transcribe_supported_locales
    attributes :campaign_id, if: -> { object.assessment.threesixty? }

    def url
      if object.assessment.agile?
        return object.is_a?(Assign) ? agile_assign_path(object) : agile_user_assessment_path(object)
      end

      return pass_assign_path(object) if object.is_a?(Assign)

      return pass_user_assessment_path(object) if object.campaign.common?

      campaign_evaluation_path(object, campaign_id: object.threesixty_campaign.id)
    end

    def campaign_id
      object.campaign.threesixty_campaign.id
    end

    def transcribe_supported_locales
      Settings.checking_wizard.audio.supported_locales
    end

    def checks
      {
        video: object.assessment.extra['enable_video_check'],
        audio: object.assessment.extra['enable_audio_check'],
        network: object.assessment.extra['enable_network_check']
      }
    end

    def config
      {
        network: Settings.checking_wizard.network.to_h,
        speed_of_me_api_token: Settings.checking_wizard.speed_of_me_api_token
      }
    end
  end
end
