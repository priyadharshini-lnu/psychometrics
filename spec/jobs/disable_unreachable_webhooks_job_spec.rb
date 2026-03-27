# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DisableUnreachableWebhooksJob, type: :job do
  describe '#perform' do
    let(:working_url) { 'https://example.com/webhook-ok' }
    let(:broken_url) { 'https://example.com/webhook-bad' }

    before do
      allow(ENV).to receive(:fetch).and_call_original
      allow(ENV).to receive(:fetch).with('REAL_ENV', 'local').and_return('local')
    end

    context 'when webhook url is reachable' do
      let!(:webhook) { create(:webhook, active: true, url: working_url) }
      let(:faraday_response) { instance_double(Faraday::Response, status: 200) }
      let(:faraday_connection) { instance_double(Faraday::Connection) }

      before do
        allow(Faraday).to receive(:new).and_return(faraday_connection)
        allow(faraday_connection).to receive(:head).with(webhook.url).and_return(faraday_response)
      end

      it 'keeps webhook active' do
        described_class.perform_now

        expect(webhook.reload.active).to eq(true)
      end
    end

    context 'when webhook url returns error response' do
      let!(:webhook) { create(:webhook, active: true, url: broken_url) }
      let(:faraday_response) { instance_double(Faraday::Response, status: 404) }
      let(:faraday_connection) { instance_double(Faraday::Connection) }

      before do
        allow(Faraday).to receive(:new).and_return(faraday_connection)
        allow(faraday_connection).to receive(:head).with(webhook.url).and_return(faraday_response)
      end

      it 'deactivates webhook' do
        described_class.perform_now

        expect(webhook.reload.active).to eq(false)
      end
    end

    context 'when webhook url is unreachable' do
      let!(:webhook) { create(:webhook, active: true, url: broken_url) }
      let(:faraday_connection) { instance_double(Faraday::Connection) }

      before do
        allow(Faraday).to receive(:new).and_return(faraday_connection)
        allow(faraday_connection).to receive(:head).with(webhook.url).
          and_raise(Faraday::ConnectionFailed.new('connection failed'))
      end

      it 'deactivates webhook' do
        described_class.perform_now

        expect(webhook.reload.active).to eq(false)
      end
    end

    context 'when environment is production' do
      let!(:webhook) { create(:webhook, active: true, url: working_url) }

      before do
        allow(ENV).to receive(:fetch).with('REAL_ENV', 'local').and_return('production')
        allow(Faraday).to receive(:new)
      end

      it 'does not update webhooks' do
        described_class.perform_now

        expect(webhook.reload.active).to eq(true)
        expect(Faraday).not_to have_received(:new)
      end
    end
  end
end
