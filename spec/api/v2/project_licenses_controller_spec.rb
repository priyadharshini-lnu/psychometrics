# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::ProjectLicensesController, type: :request do
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, parent: client) }
  let!(:license) { create(:license, client: client, is_project_specific: true) }
  let!(:project_license) do
    create(:project_license, project: project, license: license, usage_limit: 10, used_number: 5)
  end
  let!(:superadmin) { create(:superadmin) }
  before { sign_in(superadmin) }

  describe 'GET /projects/:project_id/licenses' do
    it 'fetches project Licenses list' do
      get "/api/v2/administration/projects/#{project.id}/licenses",
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      licenses = JSON.parse(response.body)
      license_response = licenses['data'].find { |c| c['id'] == license.id.to_s }

      expect(license_response['attributes']['number']).to eq(license.number)
      expect(license_response['attributes']['overuse_number']).to eq(license.overuse_number)
      expect(license_response['attributes']['project_license_details']['id']).to eq(project_license.id)
      expect(license_response['attributes']['project_license_details']['usage_limit']).
        to eq(project_license.usage_limit)
    end
  end

  describe 'POST /projects/:project_id/licenses' do
    it 'creates Project License' do
      new_license = create(:license, client: client, is_project_specific: true)
      params = {
        data: {
          type: 'licenses',
          attributes: {
            license_id: new_license.id.to_s,
            usage_limit: 20,
            enabled: true
          }
        }
      }

      post "/api/v2/administration/projects/#{project.id}/licenses",
           params: params.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      project_license = ProjectLicense.last
      expect(project_license.license_id).to eq(new_license.id)
      expect(project_license.usage_limit).to eq(20)
      expect(project_license.enabled).to be_truthy
    end
  end

  describe 'PUT /projects/:project_id/licenses/:id' do
    it 'updates Project License' do
      params = {
        data: {
          type: 'licenses',
          id: project_license.id.to_s,
          attributes: {
            usage_limit: 25,
            enabled: false
          }
        }
      }

      put "/api/v2/administration/projects/#{project.id}/licenses/#{project_license.id}",
          params: params.to_json,
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      project_license.reload
      expect(project_license.usage_limit).to eq(25)
      expect(project_license.enabled).to be_falsey
    end

    it 'cannot set usage_limit greater than parent license number' do
      parent_license = create(:license, client: client, number: 5, is_project_specific: true)
      project_license = create(:project_license, license: parent_license, project: project, usage_limit: 2,
used_number: 0)

      params = {
        data: {
          type: 'licenses',
          id: project_license.id.to_s,
          attributes: {
            usage_limit: 10
          }
        }
      }

      put "/api/v2/administration/projects/#{project.id}/licenses/#{project_license.id}",
          params: params.to_json,
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body['errors']).to be_present
    end

    it 'cannot reduce usage_limit below used number' do
      different_license = create(:license)
      project_license_with_used = create(:project_license, license: different_license, project: project,
usage_limit: 5, used_number: 4)

      params = {
        data: {
          type: 'licenses',
          id: project_license_with_used.id.to_s,
          attributes: {
            usage_limit: 2
          }
        }
      }

      put "/api/v2/administration/projects/#{project.id}/licenses/#{project_license_with_used.id}",
          params: params.to_json,
          headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:unprocessable_entity)
      body = JSON.parse(response.body)
      expect(body['errors']).to be_present
    end
  end
end
