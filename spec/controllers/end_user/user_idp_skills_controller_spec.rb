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

      parsed_response = JSON.parse(response.body)

      expect(response.status).to eq(200)
      expect(parsed_response.count).to eq(2)
      expect(parsed_response[0]['id']).to eq(user_idp_skill.id)
      expect(parsed_response[0]['name']).to eq(skill.name)
      expect(parsed_response[0]['initial_rating']).to eq(2)
    end

    it 'update user idp skill' do
      put :update, params: { id: user_idp_skill.id, initial_rating: 3 }

      parsed_response = JSON.parse(response.body)

      expect(response.status).to eq(200)
      expect(parsed_response['id']).to eq(user_idp_skill.id)
      expect(parsed_response['name']).to eq(skill.name)
      expect(parsed_response['initial_rating']).to eq(3)
    end

    it 'update user idp skill with invalid rating' do
      put :update, params: { id: user_idp_skill.id, initial_rating: 6 }

      parsed_response = JSON.parse(response.body)

      expect(response.status).to eq(422)
      expect(parsed_response['errors']).to eq(['Initial rating must be less than or equal to 5'])
    end
  end

  describe 'POST create' do
    it 'creates user idp skills' do
      post :create, params: { skills: [{ skill_id: skill.id }, { skill_id: skill2.id }] }

      expect(response.status).to eq(200)
      expect(user.user_idp_skills.count).to eq(2)
    end

    it 'returns error if skill is invalid' do
      post :create, params: { skills: [{ skill_id: nil }] }

      expect(response.status).to eq(422)
      expect(JSON.parse(response.body)).to include({ 'skill_id' => ["can't be blank"] })
    end
  end
end
