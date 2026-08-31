# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::ThreesixtyCampaigns::ReportsController, type: :controller do
  let(:current_user) { create(:superadmin) }
  let(:user) { create(:user, :with_project_membership) }
  let(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
  let!(:subject) { create(:threesixty_subject, user: user, campaign: campaign) }
  let!(:campaign_report) do
    create(:campaign_report, campaign: campaign, report: threesixty_campaign.report)
  end
  let!(:user_report) do
    create(:user_report, campaign: campaign, report: threesixty_campaign.report, user: user)
  end

  before(:each) { login_user(current_user) }
  after(:each) { sign_out(current_user) }

  describe 'GET show' do
    it 'renders successfully via token auth without an active session registry entry' do
      sign_out(current_user)

      allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(true)
      allow(Current).to receive(:client_admin_context?).and_return(true)
      allow(Current).to receive(:memberships).and_return([double('Membership')])
      allow(AdminAuth::SessionRegistry).to receive(:session_active?).and_return(false)
      allow(Reports::PrepareDataForReport).to receive(:call!).and_return({})

      # The route segment is a Campaign id despite its name; the controller finds by campaign_id.
      get :show, params: {
        threesixty_campaign_id: campaign.id,
        subject_id: subject.id,
        user_token: current_user.authentication_token
      }

      expect(response).to have_http_status(:success)
    end

    it 'redirects browser requests with an expired session registry entry' do
      allow(AdminSubdomain).to receive(:client_admin_sso_enabled?).and_return(true)
      allow(Current).to receive(:client_admin_context?).and_return(true)
      allow(Current).to receive(:memberships).and_return([double('Membership')])
      allow(AdminAuth::SessionRegistry).to receive(:session_active?).and_return(false)

      get :show, params: {
        threesixty_campaign_id: campaign.id,
        subject_id: subject.id
      }

      expect(response).to have_http_status(:redirect)
    end
  end
end
