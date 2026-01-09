# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::MhsController, type: :controller do
  describe 'OPTIONS #webhook' do
    context 'webhook validation handshake' do
      it 'returns successful handshake response with required headers' do
        process :webhook, method: :options

        expect(response).to have_http_status(:ok)
        expect(response.headers['WebHook-Allowed-Origin']).to eq('*')
        expect(response.headers['WebHook-Allowed-Rate']).to eq('1000')
        expect(response.headers['Access-Control-Allow-Origin']).to eq('*')
        expect(response.headers['Access-Control-Allow-Methods']).to eq('HEAD, POST, OPTIONS')
      end

      it 'includes custom WebHook-Allowed-Origin when Origin header present' do
        request.headers['Origin'] = 'https://mhs-janus.com'

        process :webhook, method: :options

        expect(response.headers['WebHook-Allowed-Origin']).to eq('https://mhs-janus.com')
      end
    end
  end

  describe 'POST #webhook' do
    let(:test_payload) { '{"specversion":"1.0","type":"test","source":"test","id":"123"}' }

    it 'processes the webhook successfully and logs payload' do
      allow(Rails.logger).to receive(:info)

      post :webhook, body: test_payload, as: :json

      expect(response).to have_http_status(:ok)
      expect(response.headers['WebHook-Allowed-Origin']).to eq('*')
      expect(Rails.logger).to have_received(:info).with(/Received MHS webhook payload:/)
      expect(Rails.logger).to have_received(:info).with(/Headers:/)
    end

    it 'handles any payload without validation' do
      invalid_payload = 'this is not even JSON'
      allow(Rails.logger).to receive(:info)

      post :webhook, body: invalid_payload

      expect(response).to have_http_status(:ok)
      expect(Rails.logger).to have_received(:info).with(/Received MHS webhook payload:/)
    end
  end
end
