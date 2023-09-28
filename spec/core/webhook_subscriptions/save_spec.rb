# frozen_string_literal: true

require 'rails_helper'

describe WebhookSubscriptions::Save do
  let!(:project) { create(:project) }
  let(:webhook_subscription) { create(:webhook, project_id: project.id, url: 'http://nothing.com') }

  describe '.call' do
    it 'url and current subscription are empty' do
      described_class.call!(project, '')
      expect(project.webhooks.last).to be_nil
    end
    it 'url and current subscription exist' do
      webhook_subscription
      described_class.call!(project.reload, 'http://new.domain')
      expect(project.webhooks.last.url).to eq('http://new.domain')
      expect(project.webhooks.last.id).to eq(webhook_subscription.id)
    end
    it 'url exists, current subscription is empty' do
      described_class.call!(project, 'http://new.domain')
      expect(project.webhooks.last.url).to eq('http://new.domain')
      expect(project.webhooks.last.topics.length).to eq(5)
      expect(project.webhooks.last.id).to_not eq(webhook_subscription.id)
    end
    it 'url is empty, current subscription exists' do
      described_class.call!(project, nil)
      expect(project.webhooks.last).to be_nil
    end
  end
end
