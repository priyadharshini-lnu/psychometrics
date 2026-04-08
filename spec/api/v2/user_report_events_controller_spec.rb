# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Api::V2::Administration::UserReportEventsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:normal_user) { create(:user) }
  let!(:campaign) { create(:campaign) }
  let!(:api_key) { create(:api_key, user: superadmin) }
  let(:authorization) { "Basic #{Base64.strict_encode64("#{api_key.key}:#{api_key.token}")}" }

  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/user_report_events/export' do
    it 'exports user report events' do
      post '/api/v2/administration/user_report_events/export', params: { campaign_id: campaign.id.to_s },
headers: { 'Authorization' => authorization }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq('ok')
    end

    it 'returns forbidden for users without admin permissions' do
      normal_api_key = create(:api_key, user: normal_user)
      normal_authorization = "Basic #{Base64.strict_encode64("#{normal_api_key.key}:#{normal_api_key.token}")}"
      sign_in(normal_user)

      post '/api/v2/administration/user_report_events/export', headers: { 'Authorization' => normal_authorization }

      expect(response).to have_http_status(:forbidden)
    end
  end
end
