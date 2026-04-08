# frozen_string_literal: true

module EndUser
  class SystemCheckRecordSerializer < Panko::Serializer
    attributes :id, :check_type, :passed, :data, :created_at, :finished_at, :video_url

    def passed
      campaign_user = context&.[](:campaign_user)
      return object.passed unless object.network? && campaign_user

      campaign = campaign_user.campaign
      object.meets_network_requirements?(
        minimum_download_speed: campaign.minimum_download_speed ||
                                campaign.calculated_minimum_download_speed(campaign_user),
        minimum_upload_speed: campaign.minimum_upload_speed ||
                              campaign.calculated_minimum_upload_speed(campaign_user)
      )
    end
  end
end
