# frozen_string_literal: true

require 'rails_helper'

describe EndUser::UserIdpSkillsController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:user) { create(:user, :with_project_membership, password: current_password) }

  let!(:skill) { create(:skill, name: 'abc') }
  let!(:skill2) { create(:skill, name: 'abc 2') }
  let!(:idp_template) { create(:idp_template) }
  let!(:idp_template_skill) { create(:idp_template_skill, idp_template: idp_template, skill: skill) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, idp_template: idp_template) }
  let!(:user_idp_skill) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill, initial_rating: 2) }
  let!(:user_idp_skill2) { create(:user_idp_skill, user_idp_plan: user_idp_plan, skill: skill2) }
  before(:each) do
    login_user(user)
  end

  describe 'GET index' do
    it 'returns user idp skills' do
      get :index

      parsed_response = response.parsed_body

      expect(response.status).to eq(200)
      expect(parsed_response.count).to eq(2)
      expect(parsed_response[0]['id']).to eq(user_idp_skill.id)
      expect(parsed_response[0]['name']).to eq(skill.name)
      expect(parsed_response[0]['initial_rating']).to eq(2)
    end
  end

  describe 'POST save_skills' do
    it 'saves selected idp skills for the plan' do
      post :save_skills, params: { skills: [{ skill_id: skill.id }, { skill_id: skill2.id }] }

      expect(response.status).to eq(200)
      expect(user.user_idp_skills.count).to eq(2)
    end

    it 'returns error if skill is invalid' do
      post :save_skills, params: { skills: [{ skill_id: nil }] }

      expect(response.status).to eq(422)
      expect(response.parsed_body).to include({ 'skill_id' => ["can't be blank"] })
    end

    it 'returns error if skill_type is invalid' do
      post :save_skills, params: { skills: [{ skill_id: skill.id }], skill_type: 'invalid' }

      expect(response.status).to eq(422)
      expect(response.parsed_body).to include({ 'skill_type' => ['is invalid'] })
    end

    it 'removes skills not included in the request' do
      post :save_skills, params: { skills: [{ skill_id: skill.id }] }

      expect(user.user_idp_skills.count).to eq(1)
      expect(user.user_idp_skills.first.skill_id).to eq(skill.id)
    end
  end

  describe 'PUT update' do
    it 'update user idp skill initial rating' do
      put :update, params: { id: user_idp_skill.id, initial_rating: 4 }

      expect(response.status).to eq(200)
      expect(user_idp_skill.reload.initial_rating).to eq(4)
    end
  end

  describe 'PUT toggle_privacy' do
    it 'toggles skill privacy from public to private' do
      expect(user_idp_skill.private).to be false

      put :toggle_privacy, params: { id: user_idp_skill.id }

      expect(response.status).to eq(200)
      expect(response.parsed_body['success']).to be true
      expect(response.parsed_body['message']).to include('marked as private')
      expect(user_idp_skill.reload.private).to be true
    end

    it 'toggles skill privacy from private to public' do
      user_idp_skill.update!(private: true)
      expect(user_idp_skill.private).to be true

      put :toggle_privacy, params: { id: user_idp_skill.id }

      expect(response.status).to eq(200)
      expect(response.parsed_body['success']).to be true
      expect(response.parsed_body['message']).to include('now visible')
      expect(user_idp_skill.reload.private).to be false
    end

    it 'returns error for non-existent skill' do
      put :toggle_privacy, params: { id: 99_999 }

      expect(response.status).to eq(404)
    end

    it 'includes private field in response data' do
      put :toggle_privacy, params: { id: user_idp_skill.id }

      expect(response.status).to eq(200)
      expect(response.parsed_body['data']['private']).to be true
    end
  end

  describe 'PUT #revert_to_public' do
    before do
      user_idp_skill.update!(private: true)
    end

    it 'successfully reverts private skill to public' do
      put :revert_to_public, params: { id: user_idp_skill.id }

      expect(response.status).to eq(200)
      expect(response.parsed_body['success']).to be true
      expect(response.parsed_body['data']['private']).to be false
      expect(response.parsed_body['requires_approval']).to be_in([true, false])
    end

    it 'returns error when skill is already public' do
      user_idp_skill.update!(private: false)
      put :revert_to_public, params: { id: user_idp_skill.id }

      expect(response.status).to eq(422)
      expect(response.parsed_body['success']).to be false
      expect(response.parsed_body['error']).to eq('Skill is already public')
    end

    it 'returns 404 when skill not found' do
      put :revert_to_public, params: { id: 999_999 }

      expect(response.status).to eq(404)
    end

    context 'with manager approval enabled' do
      before do
        user_idp_plan.campaign.project.idp_setting.update!(manager_approves_idp: true)
        user_idp_plan.update!(status: :draft)
      end

      it 'includes requires_approval flag when reverting from draft' do
        put :revert_to_public, params: { id: user_idp_skill.id }

        expect(response.status).to eq(200)
        expect(response.parsed_body['requires_approval']).to be false
        expect(response.parsed_body['message']).to eq("Skill '#{skill.name}' is now visible to your manager")
      end
    end
  end
end
