# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Api::V2::Administration::UserReportEventsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:normal_user) { create(:user) }
  let!(:campaign) { create(:campaign) }
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
end
