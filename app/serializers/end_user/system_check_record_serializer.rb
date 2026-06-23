# frozen_string_literal: true

module EndUser
  class SystemCheckRecordSerializer < Panko::Serializer
    attributes :id, :check_type, :passed, :data, :created_at, :finished_at, :media_url,
               :phrase_verification_status, :phrase_matched, :face_detected

    def passed
      return object.passed unless campaign_user
      return network_check_passed? if object.network?
      return face_detection_passed? && phrase_verification_passed? if object.video?
      return phrase_verification_passed? if object.audio?

      object.passed
    end

    def phrase_verification_status
      object.data&.dig('phrase_verification_status')
    end

    def phrase_matched
      object.data&.dig('phrase_matched')
    end

    def face_detected
      face_detection_passed?
    end

    private

    def face_detection_passed?
      return false unless object.video?
      return true unless campaign&.face_detection_enabled?

      object.meets_face_detection_requirements?(
        minimum_ratio: campaign.minimum_face_detection_ratio / 100.0
      )
    end

    def phrase_verification_passed?
      return true unless campaign&.phrase_verification_enabled?
      return false unless object.data&.dig('phrase_verification_status') == 'completed'

      object.data&.dig('phrase_matched') == true
    end

    def network_check_passed?
      object.meets_network_requirements?(
        minimum_download_speed: campaign.minimum_download_speed ||
                                campaign.calculated_minimum_download_speed(campaign_user),
        minimum_upload_speed: campaign.minimum_upload_speed ||
                              campaign.calculated_minimum_upload_speed(campaign_user)
      )
    end

    def campaign
      campaign_user&.campaign
    end

    def campaign_user
      context&.[](:campaign_user)
    end
  end
end
