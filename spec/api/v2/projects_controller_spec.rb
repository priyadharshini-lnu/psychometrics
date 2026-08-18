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

  describe 'POST /api/v2/administration/projects/:id/fetch_campaign_dashboard_instructions' do
    let(:path) { "/api/v2/administration/projects/#{project.id}/fetch_campaign_dashboard_instructions" }

    before do
      sign_in(superadmin)
      Mobility.with_locale('en') { project.update!(campaign_dashboard_instructions: 'English instructions') }
      Mobility.with_locale('es-ES') { project.update!(campaign_dashboard_instructions: 'Spanish instructions') }
    end

    it 'returns instructions for requested locales' do
      post path,
           params: { data: { type: 'projects', attributes: { locales: %w[en es-ES] } } }.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      parsed = response.parsed_body

      expect(parsed['list'].length).to eq(2)
      expect(parsed['list']).to include(
        { 'locale' => 'en', 'campaignDashboardInstructions' => 'English instructions' },
        { 'locale' => 'es-ES', 'campaignDashboardInstructions' => 'Spanish instructions' }
      )
    end

    it 'returns available_locales containing only locales with saved translations' do
      post path,
           params: { data: { type: 'projects', attributes: { locales: ['en'] } } }.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      parsed = response.parsed_body

      expect(parsed['availableLocales']).to include('en', 'es-ES')
    end

    it 'defaults to default locale when no locales param given' do
      post path,
           params: { data: { type: 'projects', attributes: {} } }.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      parsed = response.parsed_body

      expect(parsed['list'].length).to eq(1)
      expect(parsed['list'].first['locale']).to eq(I18n.default_locale.to_s)
    end
  end

  describe 'POST /api/v2/administration/projects/:id/update_campaign_dashboard_instructions' do
    let(:path) { "/api/v2/administration/projects/#{project.id}/update_campaign_dashboard_instructions" }
    let(:headers) { { 'Content-Type' => 'application/vnd.api+json' } }

    it 'saves instructions for the given locale' do
      sign_in(superadmin)
      body = {
        data: {
          type: 'projects',
          attributes: {
            campaign_dashboard_instructions: 'Hello from English',
            locale: 'en'
          }
        }
      }

      post path, params: body.to_json, headers: headers

      expect(response).to have_http_status(:ok)
      Mobility.with_locale('en') { expect(project.reload.campaign_dashboard_instructions).to eq('Hello from English') }
    end

    it 'saves instructions independently per locale' do
      sign_in(superadmin)
      body_en = {
        data: { type: 'projects', attributes: { campaign_dashboard_instructions: 'English text', locale: 'en' } }
      }
      body_es = {
        data: { type: 'projects', attributes: { campaign_dashboard_instructions: 'Texto en espanol', locale: 'es-ES' } }
      }

      post path, params: body_en.to_json, headers: headers
      post path, params: body_es.to_json, headers: headers

      Mobility.with_locale('en') { expect(project.reload.campaign_dashboard_instructions).to eq('English text') }
      Mobility.with_locale('es-ES') { expect(project.reload.campaign_dashboard_instructions).to eq('Texto en espanol') }
    end

    it 'clears instructions when nil is sent' do
      sign_in(superadmin)
      Mobility.with_locale('en') { project.update!(campaign_dashboard_instructions: 'Existing text') }

      body = {
        data: { type: 'projects', attributes: { campaign_dashboard_instructions: nil, locale: 'en' } }
      }

      post path, params: body.to_json, headers: headers

      expect(response).to have_http_status(:ok)
      Mobility.with_locale('en') { expect(project.reload.campaign_dashboard_instructions).to be_nil }
    end

    it 'returns the saved instructions and locale in the response' do
      sign_in(superadmin)
      body = {
        data: { type: 'projects', attributes: { campaign_dashboard_instructions: 'Response check', locale: 'en' } }
      }

      post path, params: body.to_json, headers: headers

      parsed = response.parsed_body
      expect(parsed['campaignDashboardInstructions']).to eq('Response check')
      expect(parsed['locale']).to eq('en')
    end
  end
end
