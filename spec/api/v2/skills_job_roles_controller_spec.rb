# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::SkillsJobRolesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:project) { create(:project) }
  let!(:job_role) { create(:job_role, project: project) }
  let!(:skill) { create(:skill, project: Project.find(project.id)) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/skills_job_roles' do
    get 'List Skill Mappings' do
      operationId 'getSkillMappings'
      description 'Lists all skill mappings for a project, optionally including global mappings'
      tags 'SkillsRaterSkillMappings'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :project_id, in: :query, type: :string, required: false
      parameter name: :'filter[include_global_skills_job_roles]', in: :query, type: :boolean, required: false

      context 'with global mappings' do
        response '200', 'returns both project specific and global mappings' do
          let(:project_id) { project.id }
          let(:'filter[include_global_skills_job_roles]') { 'true' }

          let!(:project_mapping) { create(:skills_job_role, job_role: job_role, skill: skill) }
          let!(:global_mapping) do
            create(:skills_job_role,
                   job_role: create(:job_role, project: nil),
                   skill: create(:skill, project: nil))
          end
          let!(:other_project_mapping) do
            create(:skills_job_role,
                   job_role: create(:job_role, project: create(:project)),
                   skill: create(:skill, project: Project.find(create(:project).id)))
          end

          run_test! do |response|
            expect(response).to have_http_status(:ok)
            json_response = JSON.parse(response.body)
            expect(json_response['data'].size).to eq(2)
            job_role_ids = json_response['data'].map do |mapping|
              mapping['relationships']['job_role']['data']['id']
            end
            expect(job_role_ids).to contain_exactly(job_role.id.to_s, global_mapping.job_role.id.to_s)
          end
        end
      end

      context 'without project_id' do
        response '200', 'returns all mappings' do
          before do
            SkillsJobRole.destroy_all
          end
          let!(:mapping1) { create(:skills_job_role, expected_proficiency_level: 1) }
          let!(:mapping2) { create(:skills_job_role, expected_proficiency_level: 2) }

          run_test! do |response|
            expect(response).to have_http_status(:ok)
            json_response = JSON.parse(response.body)
            expect(json_response['data'].size).to eq(2)
          end
        end
      end
    end

    post 'Create Skill Mapping' do
      operationId 'createSkillMapping'
      description 'Creates a new skill mapping between job role and skill'
      tags 'SkillsRaterSkillMappings'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :project_id, in: :query, type: :string, required: true
      parameter name: :body, in: :body, required: true

      response '201', 'Skill Mapping created successfully' do
        let(:project_id) { project.id }
        let(:body) do
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

        run_test! do |response|
          expect(response).to have_http_status(:created)
          data = JSON.parse(response.body)['data']

          expect(data['attributes']['skill_id']).to eq(skill.id)
          expect(data['attributes']['job_role_id']).to eq(job_role.id)
          expect(data['attributes']['expected_proficiency_level']).to eq(3)
        end
      end
    end
  end

  path '/skills_job_roles/{id}' do
    parameter name: :id, in: :path, type: :string, required: true
    parameter name: :project_id, in: :query, type: :string, required: true

    let!(:mapping) { create(:skills_job_role, job_role: job_role, skill: skill) }
    let(:id) { mapping.id }
    let(:project_id) { project.id }

    delete 'Delete Skill Mapping' do
      operationId 'deleteSkillMapping'
      description 'Deletes a skill mapping'
      tags 'SkillsRaterSkillMappings'
      consumes 'application/vnd.api+json'
      security [basic: []]

      response '204', 'Skill Mapping deleted successfully' do
        run_test! do
          expect { mapping.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
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
        post '/api/v2/administration/skills_job_roles', params: invalid_body, headers: headers, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['errors']).to include(
          a_hash_including('title' => 'A mapping with the same skill and job role already exists.')
        )
      end
    end
  end
end
