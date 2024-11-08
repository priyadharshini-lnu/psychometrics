# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Administration::DashboardsController, type: :controller do
  let(:campaign_admin_membership) { create :campaign_admin_membership }
  let(:dashboard) { create(:dashboard, campaign: campaign_admin_membership.campaign) }

  before(:each) { login_user(campaign_admin_membership.user) }
  after(:each) { sign_out(campaign_admin_membership.user) }

  describe 'GET #oracle_analytics_embed' do
    it 'generates token and renders appropriate view' do
      expect(OracleAnalytics::GetEmbedToken).to receive(:call!).and_return('token')

      get :oracle_analytics_embed, params: { id: dashboard.id }

      expect(response).to render_template('oracle_analytics_embed')
    end
  end
end
