# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::DashboardsController, type: :controller do
  let(:campaign_admin_membership) { create :campaign_admin_membership }
  let(:dashboard) { create(:dashboard, campaign: campaign_admin_membership.campaign) }

  before(:each) { login_user(campaign_admin_membership.user) }
  after(:each) { sign_out(campaign_admin_membership.user) }

  describe 'GET #oracle_analytics_embed' do
    it 'renders appropriate view' do
      get :oracle_analytics_embed, params: { id: dashboard.id }

      expect(response).to render_template('oracle_analytics_embed')
    end
  end

  describe 'POST #get_embed_token' do
    let(:params) { { id: dashboard.id, dashboard: { id: dashboard.id } } }

    it 'queues the request and sets status to in progress' do
      async_request_handler_job = class_double('AsyncRequestHandlerJob').as_stubbed_const
      allow(async_request_handler_job).to receive(:perform_later)

      post :get_embed_token, params: params

      expect(response).to have_http_status(:ok)
      expect(AsyncRequestHandlerJob).to have_received(:perform_later)

      async_request_uuid = assigns(:async_request_uuid)
      verify_async_response(async_request_uuid, 'not_started')
    end

    private

    def verify_async_response(async_request_uuid, expected_status)
      status, response = AsyncResponseRequest::GetAsyncResponse.call!(async_request_uuid)
      expect(status).to eq(expected_status)
      expect(response).to be_an_instance_of(AsyncResponseRequest::AsyncResponse)
      expect(response.processing_status).to eq(expected_status)
    end
  end
end
