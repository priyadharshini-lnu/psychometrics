# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::Campaigns::UserIdpReportsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:idp_template) { create(:idp_template) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign, idp_template: idp_template) }
  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'GET show' do
    it 'renders json response' do
      get :show, params: { new_campaign_id: campaign.id, id: user_idp_plan.id }, format: :json

      # TODO: update on implementation
      expect(response.status).to eq(200)
    end
  end

  describe 'GET pdf_preview' do
    it 'renders appropriate view' do
      get :pdf_preview, params: { new_campaign_id: campaign.id, id: user_idp_plan.id }

      expect(response).to render_template('layouts/pdf')
      expect(response).to render_template('administration/campaigns/user_idp_reports/idp_report')
    end

    it 'renders successfully via token auth without an active session registry entry' do
      sign_out(current_user)

      allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(true)
      allow(Current).to receive(:client_admin_context?).and_return(true)
      allow(Current).to receive(:memberships).and_return([double('Membership')])
      allow(AdminAuth::SessionRegistry).to receive(:session_active?).and_return(false)

      get :pdf_preview, params: {
        new_campaign_id: campaign.id,
        id: user_idp_plan.id,
        user_token: current_user.authentication_token
      }

      expect(response).to have_http_status(:success)
      expect(response).to render_template('administration/campaigns/user_idp_reports/idp_report')
    end

    it 'redirects browser requests with an expired session registry entry' do
      allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(true)
      allow(Current).to receive(:client_admin_context?).and_return(true)
      allow(Current).to receive(:memberships).and_return([double('Membership')])
      allow(AdminAuth::SessionRegistry).to receive(:session_active?).and_return(false)

      get :pdf_preview, params: { new_campaign_id: campaign.id, id: user_idp_plan.id }

      expect(response).to have_http_status(:redirect)
    end
  end

  describe 'GET download' do
    it 'returns http ok for json format' do
      expect(UserReports::GenerateIdpReportPdf).to receive(:call!)

      get :download, params: { new_campaign_id: campaign.id, id: user_idp_plan.id }, format: :json

      expect(response).to have_http_status(:ok)
    end
  end
end
