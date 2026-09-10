# frozen_string_literal: true

require 'rails_helper'

describe WebhookSystemJob do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:webhook) { create(:webhook, project_id: project.id) }

  let(:event) do
    {
      'event_name' => 'campaign_user_status',
      'event_id' => SecureRandom.uuid,
      'data' => { 'campaign' => { 'id' => campaign.id } }
    }
  end

  before { allow(Settings.features).to receive(:webhooks_enabled).and_return(true) }

  it 'delivers when the campaign has webhooks enabled' do
    expect(described_class).to receive(:post).with(webhook, event)

    described_class.perform_now(webhook.id, event)
  end

  it 'suppresses a queued event when the campaign disabled webhooks after enqueue' do
    # Event was enqueued while webhooks were allowed; the flag flips before delivery.
    campaign.campaign_options.update!(disable_webhooks: true)

    expect(described_class).not_to receive(:post)

    described_class.perform_now(webhook.id, event)
  end

  it 'does nothing when the webhooks feature is disabled' do
    allow(Settings.features).to receive(:webhooks_enabled).and_return(false)
    expect(WebhookSubscriptions::DeliverySuppressed).not_to receive(:suppressed?)
    expect(described_class).not_to receive(:post)

    described_class.perform_now(webhook.id, event)
  end
end
