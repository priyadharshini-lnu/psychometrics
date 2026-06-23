# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Api::V2::Administration::UserReportEventsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:normal_user) { create(:user) }
  let!(:campaign) { create(:campaign) }
  let!(:api_user) { create(:application_user) }
  let!(:api_key) { create(:api_key, user: api_user) }
  let(:authorization) { "Basic #{Base64.strict_encode64("#{api_key.key}:#{api_key.token}")}" }
  let(:api_json_headers) do
    {
      'Authorization' => authorization,
      'Accept' => 'application/vnd.api+json'
    }
  end

  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/user_report_events/export' do
    it 'exports user report events' do
      post '/api/v2/administration/user_report_events/export',
           params: {
             data: {
               attributes: {
                 campaign_id: campaign.id.to_s,
                 start_date: 1.week.ago.to_date.to_s,
                 end_date: Time.zone.today.to_s
               }
             },
             query: {
               campaign_id: campaign.id.to_s
             }
           }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('ok')
    end

    it 'returns forbidden for users without admin permissions' do
      sign_in(normal_user)

      post '/api/v2/administration/user_report_events/export',
           params: {
             data: {
               attributes: {
                 campaign_id: campaign.id.to_s,
                 start_date: 1.week.ago.to_date.to_s,
                 end_date: Time.zone.today.to_s
               }
             },
             query: {
               campaign_id: campaign.id.to_s
             }
           }

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'GET /api/v2/administration/user_report_events' do
    it 'returns forbidden for invalid project_id string in query' do
      get '/api/v2/administration/user_report_events',
          params: {
            query: {
              project_id: 'ping -n 11 127.0.0.1'
            }
          },
          headers: api_json_headers

      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)['error']).to be_present
    end

    it 'returns forbidden for invalid campaign_id string in query' do
      get '/api/v2/administration/user_report_events',
          params: {
            query: {
              campaign_id: 'bad-campaign-id'
            }
          },
          headers: api_json_headers

      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)['error']).to be_present
    end
  end
end
