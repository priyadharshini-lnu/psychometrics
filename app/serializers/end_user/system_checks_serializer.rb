# frozen_string_literal: true

module EndUser
  class SystemChecksSerializer < ActiveModel::Serializer
    include Rails.application.routes.url_helpers
    attributes :url, :checks, :id, :config, :transcribe_supported_locales
    attribute :campaign_id, if: -> { object.assessment.threesixty? }
    attribute :url, unless: -> { object.assessment.threesixty? }

    def url
      object.assessment.agile? ? agile_assign_path(object) : pass_assign_path(object)
    end

    def campaign_id
      object.campaign.threesixty_campaign.id
    end

    def transcribe_supported_locales
      Settings.checking_wizard.audio.supported_locales
    end

    def checks
      {
        video: object.assessment.extra['enable_video_check'] == '1',
        audio: object.assessment.extra['enable_audio_check'] == '1',
        network: object.assessment.extra['enable_network_check'] == '1'
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
