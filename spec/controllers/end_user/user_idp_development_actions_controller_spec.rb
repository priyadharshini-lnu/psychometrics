# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EndUser::UserIdpDevelopmentActionsController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:user) { create(:user, :with_project_membership, password: current_password) }
  let(:project) { Project.find(user.project.id) } # Ensure we have a proper Project instance
  let(:idp_template) { create(:idp_template) }
  let(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template, approval_status: :draft) }
  let(:skills) { create_list(:skill, 3, project: project) } # Create skills with project owner
  let(:development_action) { create(:development_action) }
  let!(:user_idp_skills) do
    skills.map { |skill| create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill) }
  end
  let!(:campaign) { create(:campaign, project: project) }

  let!(:user_idp_development_action) do
    create(:user_idp_development_action, user_idp_plan: user_idp_plan,
        user_idp_skill: user_idp_skills.first, development_action: development_action)
  end

  let!(:custom_action) do
    create(:user_idp_development_action, :with_custom_development_action,
           user_idp_plan: user_idp_plan,
           user_idp_skill: user_idp_skills.first)
  end

  before(:each) { login_user(user) }
  after(:each) { sign_out(user) }

  describe 'GET index' do
    it 'get user idp development action' do
      get :index, params: { user_id: user.id }
      parsed_result = response.parsed_body
      expect(parsed_result.keys).to include('meta')
      expect(parsed_result['meta']['record_count']).to eq(2)

      regular_action = parsed_result['data'].find { |a| a['id'] == user_idp_development_action.id }
      expect(regular_action['name']).to eq(user_idp_development_action.development_action.name)
      expect(regular_action['learning_style']).to eq(user_idp_development_action.development_action.learning_style)

      custom = parsed_result['data'].find { |a| a['id'] == custom_action.id }
      expect(custom['description']).to eq('Custom Development Task')
      expect(custom['learning_style']).to eq('on_the_job')
      expect(custom['source_type']).to eq('custom')
    end
  end

  describe 'GET available_development_actions' do
    let!(:skill_for_development_action) { skills.first }
    let!(:user_idp_skill) { user_idp_skills.find { |uis| uis.skill == skill_for_development_action } }
    let!(:development_action1) { create(:development_action, skills: [skill_for_development_action]) }
    let!(:development_action2) { create(:development_action, skills: [skill_for_development_action]) }
    let!(:development_action_with_different_skill) { create(:development_action) }

    it 'get development actions available for the skill' do
      get :available_development_actions,
          params: { user_id: user.id, user_idp_skill_id: user_idp_skill.id }
      parsed_result = response.parsed_body
      expect(parsed_result['meta']['record_count']).to eq(2)

      available_actions = parsed_result['data']
      expect(available_actions.pluck('id')).to match_array([development_action1.id, development_action2.id])
      expect(available_actions.first['name']).to eq(development_action1.name)
      expect(available_actions.first['description']).to eq(development_action1.description)
      expect(available_actions.first['learning_style']).to eq(development_action1.learning_style)
    end
  end

  describe 'GET user_idp_skills' do
    it 'get user idp skills' do
      get :user_idp_skills, params: { user_id: user.id }
      parsed_result = response.parsed_body
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

    it 'returns 422 if the plan is completed' do
      user_idp_development_action.user_idp_plan.update!(completion_status: :completed, approval_status: :approved)
      put :update_progress,
          params: { user_idp_development_action: { id: user_idp_development_action.id, progress: 80 } }
      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body['errors']).to include(I18n.t('idp.errors.cannot_update_progress_plan_completed'))
      user_idp_development_action.reload
      expect(user_idp_development_action.progress).not_to eq(80)
    end
  end

  describe 'POST generate_by_ai' do
    subject { post :generate_by_ai, params: params }

    let(:user_idp_skill) { user_idp_skills.first }
    let(:params) do
      {
        user_idp_skill_id: user_idp_skill.id.to_s,
        generate_more: 'false'
      }
    end
    let(:generated_actions) do
      [
        {
          'description' => 'Enroll in an online course designed to build expertise in advanced JavaScript concepts...',
          'learning_style' => 'structured_learning'
        },
        {
          'description' => "Join a team-focused activity where you review peers'...",
          'learning_style' => 'learning_from_others'
        }
      ]
    end

    context 'when service call is successful' do
      before do
        stub_wisper_publisher('DevelopmentActions::GenerativeService', :call, :ok, generated_actions)
      end

      it 'returns generated actions with 200 status' do
        subject

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['data']).to eq(generated_actions)
      end

      it 'calls the generative service with correct parameters' do
        subject

        expect(response).to have_http_status(:ok)
      end
    end

    context 'when regenerate limit is reached' do
      before do
        stub_wisper_publisher('DevelopmentActions::GenerativeService', :call, :error, 'Limit reached')
      end

      it 'returns error with 422 status' do
        subject

        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.parsed_body['errors']).to eq(['Limit reached'])
      end
    end
  end

  describe 'POST save_plan' do
    context 'with custom actions' do
      let(:valid_params) do
        {
          user_id: user.id,
          user_idp_development_action: [{
            id: nil,
            development_action_id: nil,
            user_idp_skill_id: user_idp_skills.first.id,
            name: 'New custom action name',
            description: 'New custom action',
            learning_style: 'on_the_job',
            source_type: 'custom',
            progress: 0,
            start_date_time: '2024-03-28 15:45',
            end_date_time: '2024-03-30 15:45',
            private: false
          }]
        }
      end

      it 'creates custom action with learning style' do
        post :save_plan, params: valid_params
        expect(response).to have_http_status(:ok)

        action = UserIdpDevelopmentAction.last
        expect(action.development_action.name).to eq('New custom action name')
        expect(action.development_action.description).to eq('New custom action')
        expect(action.development_action.learning_style).to eq('on_the_job')
        expect(action.development_action.source_type).to eq('custom')
      end

      it 'requires learning_style for custom actions' do
        params = {
          user_id: user.id,
          user_idp_development_action: [{
            id: nil,
            development_action_id: nil,
            user_idp_skill_id: user_idp_skills.first.id,
            name: 'New custom action',
            description: 'New custom action',
            learning_style: nil,
            source_type: 'custom',
            progress: 0,
            start_date_time: '2024-03-28 15:45',
            end_date_time: '2024-03-30 15:45',
            private: false
          }]
        }

        post :save_plan, params: params
        expect(response).to have_http_status(:unprocessable_entity)
        parsed_response = response.parsed_body
        expect(parsed_response['errors']).to be_present
      end

      it 'validates learning_style values' do
        params = {
          user_id: user.id,
          user_idp_development_action: [{
            id: nil,
            development_action_id: nil,
            user_idp_skill_id: user_idp_skills.first.id,
            description: 'New custom action',
            learning_style: 'not_valid_learning_style',
            source_type: 'custom',
            progress: 0,
            start_date_time: '2024-03-28 15:45',
            end_date_time: '2024-03-30 15:45',
            private: false
          }]
        }

        post :save_plan, params: params
        expect(response).to have_http_status(:unprocessable_entity)
        parsed_response = response.parsed_body
        expect(parsed_response['errors']).to be_present
      end
    end
  end
end
