# frozen_string_literal: true

require 'rails_helper'

describe Skillvue::SubscribeToWebhook do
  let(:project) { create(:project) }
  let!(:integration) { create(:integration, name: :skillvue, project: project) }
  let(:config) { { 'api_key' => 'test_api_key' } }

  let(:completion_url) { 'https://example.com/webhook/assessment-completed' }
  let(:results_url) { 'https://example.com/webhook/report-ready' }

  let(:success_response) do
    {
      'success' => true,
      'error' => nil,
      'data' => [
        {
          'event_type' => 'assessment.completed',
          'url' => completion_url
        },
        {
          'event_type' => 'report.ready',
          'url' => results_url
        }
      ]
    }
  end

  let(:client) { instance_double(Faraday::Connection) }
  let(:response) { instance_double(Faraday::Response, status: 200, body: success_response.to_json) }
  let(:request) { double }

  subject { described_class.new(project) }

  before do
    allow_any_instance_of(described_class).to receive(:config).and_return(config)
    allow(subject).to receive(:client).and_return(client)
    allow(client).to receive(:post).and_yield(request).and_return(response)
    allow(request).to receive(:url)
    allow(request).to receive(:body=)
  end

  describe '#call' do
    context 'when the request is successful' do
      it 'broadcasts :ok' do
        expect { subject.call }.to broadcast(:ok)
      end

      it 'sends the correct webhook URLs in the request body' do
        expect(request).to receive(:url).with(subject.send(:subscription_url))
        expect(request).to receive(:body=) do |body_json|
          body = JSON.parse(body_json)
          expect(body['subscriptions'].length).to eq(2)
          expect(body['subscriptions'][0]['event']).to eq('assessment.completed')
          expect(body['subscriptions'][1]['event']).to eq('report.ready')

          expect(body['subscriptions'][0]['callback_url']).to include(project.id.to_s)
          expect(body['subscriptions'][1]['callback_url']).to include(project.id.to_s)
        end

        subject.call
      end

      it 'updates the integration config with received webhook URLs' do
        subject.call

        integration.reload
        expect(integration.config['assessment_completion_notification_url']).to eq(completion_url)
        expect(integration.config['assessment_result_notification_url']).to eq(results_url)
      end
    end

    context 'when the API response is not success' do
      let(:error_message) { 'API Error' }
      let(:error_response) do
        {
          'success' => false,
          'error' => error_message,
          'data' => nil
        }
      end

      before do
        allow(response).to receive(:status).and_return(400)
        allow(response).to receive(:body).and_return(error_response)
      end

      it 'raises SubscribeToWebhookFailed exception' do
        expect do
          subject.call
        end.to raise_error(Skillvue::Exceptions::SubscribeToWebhookFailed,
                           /Skillvue::SubscribeToWebhook failed for Project: #{project.id}/)
      end
    end

    context 'when a network error occurs' do
      before do
        allow(client).to receive(:post).and_raise(Faraday::ConnectionFailed.new('Connection error'))
        allow(Sentry).to receive(:capture_exception)
      end

      it 'captures the exception in Sentry and broadcasts :ok' do
        expect(Sentry).to receive(:capture_exception).with(
          instance_of(Faraday::ConnectionFailed),
          extra: { project_id: project.id }
        )

        expect { subject.call }.to broadcast(:ok)
      end
    end

    context 'when no integration exists for the project' do
      before do
        integration.destroy
      end

      it 'does not update any integration' do
        expect(subject).to receive(:save_webhook_urls_to_integration)
        expect_any_instance_of(Integration).not_to receive(:update!)

        expect { subject.call }.to broadcast(:ok)
      end
    end
  end
end
