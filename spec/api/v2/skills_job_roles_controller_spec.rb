# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::SkillsJobRolesController, type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:project) { create(:project) }
  let!(:job_role) { create(:job_role, project: project) }
  let!(:skill) { create(:skill, project: Project.find(project.id)) }
  before { sign_in(superadmin) }

  describe 'GET /skills_job_roles' do
    context 'with project_id' do
      it 'returns project specific mappings' do
        project_mapping = create(:skills_job_role, job_role: job_role, skill: skill, project: project)
        create(:skills_job_role,
               job_role: create(:job_role, project: nil),
               skill: create(:skill, project: nil),
               project_id: nil)

        get '/api/v2/administration/skills_job_roles',
            params: { project_id: project.id },
            headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['data'].pluck('id')).to contain_exactly(project_mapping.id.to_s)
      end
    end

    context 'without project_id' do
      it 'returns global mappings' do
        SkillsJobRole.destroy_all
        create(:skills_job_role, expected_proficiency_level: 1, project_id: nil)
        create(:skills_job_role, expected_proficiency_level: 2, project_id: nil)

        get '/api/v2/administration/skills_job_roles',
            headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['data'].size).to eq(2)
      end
    end
  end

  describe 'POST /skills_job_roles' do
    it 'creates skill mapping successfully' do
      body = {
        data: {
          type: 'skills_job_roles',
          attributes: {
            job_role_id: job_role.id,
            skill_id: skill.id,
            project_id: project.id,
            expected_proficiency_level: 3
          }
        }
      }

      post '/api/v2/administration/skills_job_roles',
           params: body.to_json,
           headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body)['data']
      expect(data['attributes']['skill_id']).to eq(skill.id.to_s)
      expect(data['attributes']['job_role_id']).to eq(job_role.id.to_s)
      expect(data['attributes']['expected_proficiency_level']).to eq(3)
    end
  end

  describe 'DELETE /skills_job_roles/:id' do
    it 'deletes skill mapping successfully' do
      mapping = create(:skills_job_role, job_role: job_role, skill: skill, project_id: project.id)

      delete "/api/v2/administration/skills_job_roles/#{mapping.id}",
             params: { project_id: project.id }.to_json,
             headers: { 'Content-Type' => 'application/vnd.api+json' }

      expect(response).to have_http_status(:no_content)
      expect { mapping.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  context 'Contract Validations' do
    describe 'Uniqueness validations' do
      let(:project_id) { project.id }
      let!(:existing_mapping) do
        create(:skills_job_role, job_role: job_role, skill: skill, expected_proficiency_level: 2)
      end

      let(:invalid_body) do
        {
          data: {
            type: 'skills_job_roles',
            attributes: {
              job_role_id: job_role.id,
              skill_id: skill.id,
              expected_proficiency_level: 3
            }
          }
        }
      end

      it 'rejects duplicate skill job role mappings' do
        post '/api/v2/administration/skills_job_roles',
             params: invalid_body.to_json,
             headers: { 'Content-Type' => 'application/vnd.api+json' }

        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to include(
          a_hash_including('title' => 'A mapping with the same skill and job role already exists.')
        )
      end
    end
  end
end
