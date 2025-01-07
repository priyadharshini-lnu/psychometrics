# frozen_string_literal: true

module CampaignUsers
  class Webhook
    private_attr_reader :campaign_user, :project, :webhook_id

    def initialize(campaign_user, webhook_id = nil)
      @campaign_user = campaign_user
      @project = campaign_user.campaign.project
      @webhook_id = webhook_id
    end

    def publish_campaign_user_status
      WebhookSubscriptions::Publish.call(
        project, :campaign_user_status, campaign_user_status_data, webhook_id: webhook_id
      )
    end

    def publish_campaign_results_available
      return unless campaign_user.campaign.campaign_factors.exists?

      WebhookSubscriptions::Publish.call(
        project, :campaign_results_available, campaign_results_available_data, webhook_id: webhook_id
      )
    end

    def campaign_user_status_data
      {
        campaign: campaign_user.campaign,
        subject: campaign_user.user,
        status: campaign_user.status
      }
    end

    def campaign_results_available_data
      {
        campaign: campaign_user.campaign,
        subject: campaign_user.user,
        results: CampaignUsers::Results.call!(campaign_user)
      }
    end
  end
end
