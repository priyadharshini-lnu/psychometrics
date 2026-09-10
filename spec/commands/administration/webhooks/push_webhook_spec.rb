# frozen_string_literal: true

require 'rails_helper'

describe Administration::Webhooks::PushWebhook do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:subscription) { create(:webhook, project_id: project.id) }

  let(:event) do
    {
      'event_name' => 'campaign_user_status',
      'event_id' => SecureRandom.uuid,
      'data' => { 'campaign' => { 'id' => campaign.id } }
    }
  end

  it 'delivers when the campaign has webhooks enabled' do
    expect(WebhookSystem::Job).to receive(:perform_now).with(subscription, event)

    expect { described_class.call(subscription, event) }.to broadcast(:ok)
  end

  it 'suppresses delivery when the campaign has webhooks disabled' do
    campaign.campaign_options.update!(disable_webhooks: true)

    expect(WebhookSystem::Job).not_to receive(:perform_now)

    expect { described_class.call(subscription, event) }.to broadcast(:ok)
  end
end
