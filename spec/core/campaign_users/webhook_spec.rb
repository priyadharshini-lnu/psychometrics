# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CampaignUsers::Webhook do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:campaign_factor) { create(:campaign_factor, campaign: campaign) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:webhook) do
    create(:webhook, :with_topics, project_id: campaign.project_id, names: %w[campaign_user_status])
  end
  let!(:campaign_factor_value) { create(:campaign_factor_value, campaign: campaign, user: user) }

  describe '#publish_campaign_user_status' do
    it 'publishes campaign user status' do
      campaign_user_status_data = {
        campaign: campaign_user.campaign,
        subject: campaign_user.user,
        status: campaign_user.status,
        event_time: campaign_user.updated_at
      }

      expect(WebhookSubscriptions::Publish).to receive(:call).with(
        campaign.project, :campaign_user_status, campaign_user_status_data, webhook_id: webhook.id
      )
      described_class.new(campaign_user, webhook.id).publish_campaign_user_status
    end
  end

  describe '#publish_campaign_results_available' do
    it 'publishes campaign results available' do
      campaign_user.update!(campaign_scores_finalized_date: Time.current)
      campaign_results_available_data = {
        campaign: campaign_user.campaign,
        subject: campaign_user.user,
        results: [
          {
            id: campaign_factor_value.campaign_factor.code,
            name: campaign_factor_value.campaign_factor.name,
            value: campaign_factor_value.value,
            value_type: campaign_factor_value.campaign_factor.output_type
          }
        ],
        event_time: campaign_user.campaign_scores_finalized_date
      }

      expect(WebhookSubscriptions::Publish).to receive(:call).with(
        campaign.project, :campaign_results_available, campaign_results_available_data, webhook_id: webhook.id
      )
      described_class.new(campaign_user, webhook.id).publish_campaign_results_available
    end
  end
end
