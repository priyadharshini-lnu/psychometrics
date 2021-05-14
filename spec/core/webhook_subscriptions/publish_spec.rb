# frozen_string_literal: true

require 'rails_helper'

describe WebhookSubscriptions::Publish do
  let(:webhook_subscription) { create(:webhook_subscription, url: 'http://nothing.com') }
  let(:project) { create(:project, webhook_subscription: webhook_subscription) }
  let(:campaign) { create(:campaign, name: 'camp#1') }
  let(:assessment) { create(:assessment, name: 'assessment#1') }
  let(:evaluator) { create(:user, first_name: 'Francis', last_name: 'Ngannou') }
  let(:subject) { create(:user, first_name: 'Stipe', last_name: 'Miocic') }

  describe '.call' do
    it 'assessment_started' do
      data = { campaign: campaign, assessment: assessment, evaluator: evaluator, subject: subject }
      expect(WebhookSystemJob).to receive(:perform_later).
        with(webhook_subscription, {
          'event_name' => 'assessment_started',
          'event_id' => anything,
          'data' => anything
        })
      described_class.call!(project, :assessment_started, data)
    end
  end
end
