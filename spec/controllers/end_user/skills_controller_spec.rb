# frozen_string_literal: true

require 'rails_helper'

describe EndUser::SkillsController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:user) { create(:user, :with_project_membership, password: current_password) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, active: true) }
  let(:project) { Project.find(user.project.id) }  # Ensure we have a proper Project instance
  let!(:skill) { create(:skill, name: 'abc', project: project) }
  let!(:skill2) { create(:skill, name: 'cde', project: project) }
  let!(:job_role) { create(:job_role, name: 'developer', skills: [skill, skill2]) }
  let!(:job_role2) { create(:job_role, name: 'manager', skills: [skill2]) }

  before(:each) do
    login_user(user)
  end

  describe 'GET index' do
    it 'returns skills by search query' do
      get :index, params: { filters: { name_cont: 'ab', job_roles_id_eq: job_role.id } }

      parsed_response = JSON.parse(response.body)

      expect(response.status).to eq(200)
      expect(parsed_response.count).to eq(1)
      expect(parsed_response[0]['id']).to eq(skill.id)
      expect(parsed_response[0]['name']).to eq(skill.name)
    end

    it 'returns skills by search query' do
      get :index, params: { filters: { name_cont: 'c', job_roles_id_eq: job_role2.id } }

      parsed_response = JSON.parse(response.body)

      expect(response.status).to eq(200)
      expect(parsed_response.count).to eq(1)
      expect(parsed_response[0]['id']).to eq(skill2.id)
      expect(parsed_response[0]['name']).to eq(skill2.name)
    end

    it 'returns all skills' do
      get :index, params: { filters: { name_cont: 'c' } }

      parsed_response = JSON.parse(response.body)

      expect(response.status).to eq(200)
      expect(parsed_response.count).to eq(2)
    end
  end
end
