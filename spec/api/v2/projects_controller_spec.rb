# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ProjectsController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:project_admin) { create(:user, project: project, role: 'Users::Admin') }
  let!(:campaign) { create(:campaign) }
  let!(:project) { campaign.project }
  let!(:client) { project.client }
  let!(:client_id) { client.id }
  let!(:project_membership) { create(:project_admin_membership, user: project_admin, client: project) }
  before { sign_in(project_admin) }

  describe 'GET /api/v2/administration/clients/:client_id/projects' do
    it 'fetches Projects list' do
      get "/api/v2/administration/clients/#{client_id}/projects",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      clients = JSON.parse(response.body)
      client_response = clients['data'].find { |c| c['id'] == project.id.to_s }
      expect(client_response).to have_key('id')
      expect(client_response).to have_attribute(:name).with_value(project.name)
    end
  end

  describe 'POST /api/v2/administration/clients/:client_id/projects' do
    it 'creates Project' do
      sign_in(superadmin)

      body = {
        data: {
          type: 'projects',
          attributes: {
            name: 'Project Name',
            subdomain: 'project-subdomain-12345',
            number: '123'
          }
        }
      }

      post "/api/v2/administration/clients/#{client_id}/projects",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      client_response = JSON.parse(response.body)['data']
      expect(client_response).to have_key('id')
      expect(client_response).to have_attribute(:name).with_value('Project Name')
    end

    it 'returns 422 if subdomain contains reserved admin keyword' do
      sign_in(superadmin)

      body = {
        data: {
          type: 'projects',
          attributes: {
            name: 'Project Name',
            subdomain: 'illegal-admin-test',
            number: '123'
          }
        }
      }

      post "/api/v2/administration/clients/#{client_id}/projects",
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:unprocessable_entity)
      json_response = JSON.parse(response.body)
      expected_error = I18n.t('admin.subdomain_admin_keyword')
      expect(json_response['errors'].first['title']).to include(expected_error)
    end
  end

  describe 'PATCH /api/v2/administration/projects/:id' do
    it 'updates project' do
      sign_in(superadmin)

      body = {
        data: {
          type: 'projects',
          id: project.id.to_s,
          attributes: {
            disabled: true
          }
        }
      }

      patch "/api/v2/administration/projects/#{project.id}",
            params: body.to_json,
            headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /api/v2/administration/projects/:project_id/seach_user' do
    it 'fetches Projects users list' do
      user = create(:user, project: project)

      get "/api/v2/administration/projects/#{project.id}/seach_user",
          params: { 'filter[search_query]' => 'test' },
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      users = JSON.parse(response.body)

      users_response = users['data'].find { |u| u['id'] == user.id.to_s }
      expect(users_response).to have_key('id')
      expect(users_response).to have_attribute(:name).with_value(user.name)
    end
  end

  describe 'PUT /api/v2/administration/projects/:project_id/add_manager' do
    it 'adds manager to user successfully' do
      user = create(:user, project: project)
      manager = create(:user, project: project)

      body = { id: project.id.to_s, user_id: user.id.to_s, manager_id: manager.id.to_s }

      put "/api/v2/administration/projects/#{project.id}/add_manager",
          params: body.to_json,
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      manager_response = JSON.parse(response.body)['data']
      expect(manager_response).to have_key('id')
      expect(manager_response).to have_attribute(:email).with_value(manager.email)
      expect(manager_response).to have_attribute(:name).with_value(manager.decorate.full_name)
    end

    it 'returns error for invalid manager or user' do
      other_project = create(:project)
      manager = create(:user, project: other_project)

      body = { id: project.id.to_s, user_id: '9999', manager_id: manager.id.to_s }

      put "/api/v2/administration/projects/#{project.id}/add_manager",
          params: body.to_json,
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)['errors']

      expect(errors.any? { |e| e['title'] == 'Manager not found or not part of the same project' }).to be_truthy
      expect(errors.any? { |e| e['title'] == 'User not found or not part of the same project' }).to be_truthy
    end
  end
end
