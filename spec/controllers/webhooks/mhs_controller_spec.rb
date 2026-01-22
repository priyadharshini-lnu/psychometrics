# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Webhooks::MhsController, type: :controller do
  describe 'HEAD #webhook' do
    it 'returns ok with cache control headers' do
      head :webhook

      expect(response).to have_http_status(:ok)
      expect(response.headers['Cache-Control']).to include('no-store')
    end
  end

  describe 'OPTIONS #webhook' do
    it 'returns successful handshake response' do
      process :webhook, method: :options

      expect(response).to have_http_status(:ok)
      expect(response.headers['WebHook-Allowed-Origin']).to eq('*')
    end
  end

  describe 'POST #webhook' do
    let(:user_assessment) { create(:user_assessment) }
    let(:data_gathering_id) { 'test-instance-789' }
    let!(:mhs_user_assessment) do
      mua = create(:mhs_user_assessment, user_assessment: user_assessment)
      mua.update!(data_gathering_id: data_gathering_id)
      mua
    end
    let(:payload) do
      {
        'type' => 'MHS.Janus.DataGatherer.Complete',
        'source' => "https://services.mhs.com/JANUS/2022-10/sessions/session123/dataGatherers/gatherer456/instances/#{data_gathering_id}/save",
        'time' => '2026-01-19T16:27:32.6536895Z',
        'data' => {
          'details' => [
            { 'code' => 200, 'description' => 'Success' }
          ]
        }
      }
    end

    context 'with successful completion' do
      it 'marks user assessment as completed' do
        post :webhook, body: payload.to_json, as: :json

        user_assessment.reload
        expect(user_assessment.status).to eq('completed')
        expect(response).to have_http_status(:ok)
      end
    end

    context 'with invalid JSON' do
      it 'returns bad request' do
        expect(Rails.logger).to receive(:error).with(/Invalid JSON in MHS webhook/)

        post :webhook, body: 'invalid json'

        expect(response).to have_http_status(:bad_request)
      end
    end

    context 'with unsupported event type' do
      let(:unsupported_payload) do
        payload.merge('type' => 'MHS.Janus.Other.Event')
      end

      it 'ignores the event' do
        post :webhook, body: unsupported_payload.to_json, as: :json

        expect(response).to have_http_status(:ok)
      end
    end
  end
end
