# frozen_string_literal: true

require 'rails_helper'
RSpec.describe Api::V2::Administration::JobRolesController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:project) { create(:project) }
  let!(:job_group) { create(:job_group, project: project) }
  before { sign_in(superadmin) }

  describe 'GET /api/v2/administration/job_roles' do
    context 'when only project id is passed' do
      it 'returns only project specific job roles' do
        create_list(:job_role, 3, project: project, job_group: job_group)
        create(:job_role, project: nil)
        create(:job_role, project: create(:project))

        get '/api/v2/administration/job_roles', params: { project_id: project.id }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['data'].size).to eq(3)
        expect(json_response['data'].all? do |role|
          role['attributes']['project_id'].to_s == project.id.to_s
        end).to be true
      end
    end

    context 'all job roles' do
      it 'returns all job roles when no filter applied' do
        create_list(:job_role, 3, project: project, job_group: job_group)
        create_list(:job_role, 2, project: nil) # Global roles
        create(:job_role, project: create(:project)) # Different project

        get '/api/v2/administration/job_roles'

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['data'].size).to eq(2)
      end
    end
  end

  describe 'POST /api/v2/administration/job_roles' do
    it 'creates a new job role' do
      body = {
        data: {
          type: 'job_roles',
          attributes: {
            name: 'Senior Developer',
            code: 'SRD',
            description: 'Rails senior developer',
            job_group_id: job_group.id,
            project_id: project.id
          }
        }
      }

      post "/api/v2/administration/job_roles?project_id=#{project.id}", params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      expect(project.job_roles.count).to eq(1)
    end
  end

  describe 'PATCH /api/v2/administration/job_roles/:id' do
    it 'updates a job role' do
      job_role = create(:job_role, project: project, job_group: job_group)
      body = {
        data: {
          type: 'job_roles',
          id: job_role.id.to_s,
          attributes: {
            name: job_role.name,
            description: 'new',
            job_group_id: job_group.id
          }
        }
      }

      patch "/api/v2/administration/job_roles/#{job_role.id}?project_id=#{project.id}", params: body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:ok)
      expect(job_role.reload.description).to eq('new')
    end
  end

  describe 'DELETE /api/v2/administration/job_roles/:id' do
    it 'deletes a job role' do
      job_role = create(:job_role, project: project, job_group: job_group)

      delete "/api/v2/administration/job_roles/#{job_role.id}?project_id=#{project.id}",
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
      expect { job_role.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe 'Contract Validations' do
    describe 'Uniqueness validations' do
      it 'rejects duplicate names within same job group' do
        create(:job_role, name: 'Duplicate', job_group: job_group)
        invalid_body = {
          data: {
            type: 'job_roles',
            attributes: {
              name: 'Duplicate',
              description: 'Valid description',
              job_group_id: job_group.id
            }
          }
        }

        post "/api/v2/administration/job_roles?project_id=#{project.id}", params: invalid_body.to_json,
headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include(
          a_hash_including('title' => 'A job role with the same name already exists.')
        )
      end
    end
  end
end
