# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::DirectReporteesController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:manager) { create(:user, :with_project_membership) }
  let!(:user) { create(:user, manager_id: manager.id) }
  let!(:campaign) { create(:campaign, project: manager.project) }
  let!(:user_idp_plan) do
    create(:user_idp_plan, user: user, campaign: campaign, active: true, approval_status: :pending_approval)
  end
  let!(:campaign_user) { create(:campaign_user, user: user, campaign: campaign, active: true) }

  before(:each) { login_user(manager) }
  after(:each) { sign_out(manager) }

  describe 'GET #index' do
    it 'returns user idp plans for direct reportees' do
      get :index
      expect(response).to have_http_status(:ok)

      parsed = response.parsed_body

      expected_plan = EndUser::DirectReporteeSerializer.
                      new(context: { current_user: manager }).serialize(user_idp_plan)

      expect(parsed['data']).to eq([expected_plan.as_json])
      expect(parsed['meta']).to eq({ 'count' => 1 })
    end
  end
end
