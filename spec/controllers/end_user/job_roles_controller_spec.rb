# frozen_string_literal: true

require 'rails_helper'

describe EndUser::JobRolesController, type: :controller do
  let(:current_password) { 'Current@Password129' }
  let!(:user) { create(:user, :with_project_membership, password: current_password) }
  let(:project) { Project.find(user.project.id) } # Ensure we have a proper Project instance
  let!(:skill) { create(:skill, name: 'abc', project: project) }
  let!(:skill2) { create(:skill, name: 'cde', project: project) }
  let!(:job_role) { create(:job_role, name: 'developer', skills: [skill, skill2]) }
  let!(:job_role2) { create(:job_role, name: 'manager', skills: [skill, skill2]) }

  before(:each) do
    login_user(user)
  end

  describe 'GET index' do
    it 'returns job role by search query' do
      get :index, params: { filters: { name_cont: 'dev' } }

      parsed_response = response.parsed_body

      expect(response.status).to eq(200)
      expect(parsed_response.count).to eq(1)
      expect(parsed_response[0]['id']).to eq(job_role.id)
      expect(parsed_response[0]['name']).to eq(job_role.name)
    end

    it 'returns job_roles' do
      get :index, params: { filters: { name_cont: 'e' } }

      parsed_response = response.parsed_body

      expect(response.status).to eq(200)
      expect(parsed_response.count).to eq(2)
    end
  end
end
