# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::DirectReportsController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:manager) { create(:user, :with_project_membership) }
  let!(:user) { create(:user, project: manager.project, manager_id: manager.id) }
  let!(:campaign) { create(:campaign) }
  let!(:user_idp_plan) do
    create(:user_idp_plan, user: user, campaign: campaign, active: true, status: :pending_approval)
  end

  before(:each) { login_user(manager) }
  after(:each) { sign_out(manager) }

  describe 'GET summary' do
    it 'get user idp plan summary' do
      get :index
      parsed_result = JSON.parse(response.body)

      expect(parsed_result).to eq({
        data: [
          id: user_idp_plan.id,
          status: 'pending_approval',
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            photo: nil,
            age: nil,
            gender: nil
          }
        ],
        meta: {}
      }.deep_stringify_keys)
    end
  end
end
