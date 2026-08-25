# frozen_string_literal: true

require 'rails_helper'

describe WebhookSubscriptions::Publish do
  let!(:project) { create(:project) }
  let(:webhook) { create(:webhook, url: 'http://nothing.com', project_id: project.id) }
  let!(:topic) { create(:topic, subscription_id: webhook.id) }
  let(:campaign) { create(:campaign, name: 'camp#1', project: project) }
  let(:assessment) { create(:assessment, name: 'assessment#1') }
  let(:subject) { create(:user, first_name: 'Stipe', last_name: 'Miocic') }
  let!(:user_assessment) do
    create(:user_assessment, campaign: campaign, assessment: assessment, subject: subject)
  end
  let(:evaluator) { create(:user, first_name: 'Francis', last_name: 'Ngannou') }

  describe '.call' do
    it 'assessment_started' do
      data = { campaign: campaign, assessment: assessment, evaluator: evaluator, subject: subject }
      expect(WebhookSystemJob).to receive(:perform_later).
        with(webhook.id, {
          'event_name' => 'assessment_started',
          'event_id' => anything,
          'data' => anything
        })
      expect do
        described_class.call(project, :assessment_started, data)
      end.to broadcast(:ok)
    end

    it 'assessment_raw_response' do
      raw_response_webhook = create(:webhook, project_id: project.id)
      create(:topic, subscription: raw_response_webhook, name: 'assessment_raw_response')

      data = {
        campaign: campaign,
        assessment: assessment,
        subject: subject,
        event_time: Time.current,
        answers: []
      }
      expect(WebhookSystemJob).to receive(:perform_later).
        with(raw_response_webhook.id, {
          'event_name' => 'assessment_raw_response',
          'event_id' => anything,
          'data' => anything
        })
      expect do
        described_class.call(project, :assessment_raw_response, data)
      end.to broadcast(:ok)
    end

    it 'adds localized data to payloadif webhook has include_locales true' do
      webhook.update(include_locales: true)
      data = { campaign: campaign, assessment: assessment, evaluator: evaluator, subject: subject }
      expect(WebhookSystemJob).to receive(:perform_later).
        with(webhook.id, {
          'event_name' => 'assessment_started',
          'event_id' => anything,
          'data' => hash_including('locale' => anything)
        })
      expect do
        described_class.call(project, :assessment_started, data, record: user_assessment)
      end.to broadcast(:ok)
    end

    it 'doesnt add localized data to payload if webhook has include_locales false' do
      webhook.update(include_locales: false)
      data = { campaign: campaign, assessment: assessment, evaluator: evaluator, subject: subject }
      expect(WebhookSystemJob).to receive(:perform_later).
        with(webhook.id, {
          'event_name' => 'assessment_started',
          'event_id' => anything,
          'data' => hash_not_including('locale')
        })
      expect do
        described_class.call(project, :assessment_started, data, record: user_assessment)
      end.to broadcast(:ok)
    end

    it 'does not enqueue webhook for UAT users' do
      uat_subject = create(:user, first_name: 'Uat', last_name: 'Subject', is_uat: true)
      data = { campaign: campaign, assessment: assessment, evaluator: evaluator, subject: uat_subject }

      expect(WebhookSystemJob).not_to receive(:perform_later)
      expect do
        described_class.call(project, :assessment_started, data)
      end.to broadcast(:ok)
    end
  end
end
