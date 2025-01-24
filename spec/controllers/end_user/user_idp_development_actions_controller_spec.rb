# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::UserIdpDevelopmentActionsController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:user) { create(:user, :with_project_membership, password: current_password) }
  let(:project) { Project.find(user.project.id) } # Ensure we have a proper Project instance
  let(:idp_template) { create(:idp_template) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template) }
  let(:skills) { create_list(:skill, 3, project: project) }  # Create skills with project owner
  let(:development_action) { create(:development_action) }
  let(:development_action1) { create(:development_action) }
  let!(:user_idp_skills) do
    skills.map { |skill| create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill) }
  end
  let!(:idp_template_development_action) do
    create(:idp_template_development_action, idp_template: idp_template,
    development_action: development_action)
  end

  let!(:idp_template_development_action1) do
    create(:idp_template_development_action, idp_template: idp_template,
    development_action: development_action1)
  end

  let!(:user_idp_development_action) do
    create(:user_idp_development_action, user_idp_plan: user_idp_plan,
        user_idp_skill: user_idp_skills.first, development_action: development_action)
  end

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET index' do
    it 'get user idp development action' do
      get :index, params: { user_id: user.id }
      parsed_result = JSON.parse(response.body)
      expect(parsed_result.keys).to include('meta')
      expect(parsed_result['meta']['record_count']).to eq(1)
      expect(parsed_result['data'][0]['id']).to eq(user_idp_development_action.id)
      expect(parsed_result['data'][0]['name']).to eq(user_idp_development_action.development_action.name)
    end
  end

  describe 'GET available_development_actions' do
    it 'get development actions available in the idp template' do
      get :available_development_actions, params: { user_id: user.id }
      parsed_result = JSON.parse(response.body)
      expect(parsed_result['meta']['record_count']).to eq(1)
      expect(parsed_result['data'][0]['id']).to eq(idp_template_development_action1.id)
      expect(parsed_result['data'][0]['name']).to eq(idp_template_development_action1.development_action.name)
    end
  end

  describe 'GET user_idp_skills' do
    it 'get user idp skills' do
      get :user_idp_skills, params: { user_id: user.id }
      parsed_result = JSON.parse(response.body)
      expect(parsed_result['meta']['record_count']).to eq(3)
    end
  end

  describe 'PUT update_progress' do
    it 'updates progress of user idp development action' do
      put :update_progress,
          params: { user_idp_development_action: { id: user_idp_development_action.id, progress: 50 } }
      expect(response).to have_http_status(:ok)
      user_idp_development_action.reload
      expect(user_idp_development_action.progress).to eq(50)
    end
  end
end
