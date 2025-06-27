# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::JobRolesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:project) { create(:project) }
  let!(:job_group) { create(:job_group, project: project) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/job_roles' do
    get 'List Job Roles' do
      operationId 'getJobRoles'
      description 'Lists all job roles for a project, optionally including global roles'
      tags 'SkillsRaterJobRoles'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :project_id, in: :query, type: :string, required: false
      parameter name: :'filter[include_global_roles]', in: :query, type: :boolean, required: false

      context 'when only project id is passed' do
        response '200', 'returns only project specific job roles' do
          let(:project_id) { project.id }

          before do
            create_list(:job_role, 3, project: project, job_group: job_group)
            create(:job_role, project: nil)
            create(:job_role, project: create(:project))
          end

          run_test! do |response|
            expect(response).to have_http_status(:ok)
            json_response = JSON.parse(response.body)
            expect(json_response['data'].size).to eq(3)
            expect(json_response['data'].all? do |role|
              role['attributes']['project_id'].to_s == project.id.to_s
            end).to be true
          end
        end
      end

      context 'with include_global_roles filter' do
        response '200', 'returns both project specific and global job roles' do
          let(:project_id) { project.id }
          let(:'filter[include_global_roles]') { 'true' }

          before do
            create_list(:job_role, 3, project: project, job_group: job_group)
            create_list(:job_role, 2, project: nil)
            create(:job_role, project: create(:project))
          end

          run_test! do |response|
            expect(response).to have_http_status(:ok)
            json_response = JSON.parse(response.body)
            expect(json_response['data'].size).to eq(5)

            project_ids = json_response['data'].map do |role|
              role['attributes']['project_id']
            end
            expect(project_ids).to include(project.id.to_s)
          end
        end
      end

      context 'all job roles' do
        response '200', 'returns all job roles when no filter applied' do
          before do
            create_list(:job_role, 3, project: project, job_group: job_group)
            create_list(:job_role, 2, project: nil) # Global roles
            create(:job_role, project: create(:project)) # Different project
          end

          run_test! do |response|
            expect(response).to have_http_status(:ok)
            json_response = JSON.parse(response.body)
            expect(json_response['data'].size).to eq(6)
          end
        end
      end
    end

    post 'Create Job Role' do
      operationId 'createJobRole'
      description 'Creates a new job role'
      tags 'SkillsRaterJobRoles'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :project_id, in: :query, type: :string, required: true
      parameter name: :body, in: :body, required: true

      response '201', 'Job Role created successfully' do
        let(:project_id) { project.id }
        let(:body) do
          {
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
        end

        run_test! do |response|
          expect(response).to have_http_status(:created)
          expect(project.job_roles.count).to eq(1)
        end
      end
    end
  end

  path '/job_roles/{id}' do
    parameter name: :id, in: :path, type: :string, required: true
    parameter name: :project_id, in: :query, type: :string, required: true

    let!(:job_role) { create(:job_role, project: project, job_group: job_group) }
    let(:id) { job_role.id }
    let(:project_id) { project.id }

    patch 'Update Job Role' do
      operationId 'updateJobRole'
      description 'Updates a job role'
      tags 'SkillsRaterJobRoles'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :body, in: :body, required: true

      response '200', 'Job Role updated successfully' do
        let(:body) do
          {
            data: {
              type: 'job_roles',
              id: id.to_s,
              attributes: {
                name: job_role.name,
                description: 'new',
                job_group_id: job_group.id
              }
            }
          }
        end

        run_test! do
          expect(job_role.reload.description).to eq('new')
        end
      end
    end

    delete 'Delete Job Role' do
      operationId 'deleteJobRole'
      description 'Deletes a job role'
      tags 'SkillsRaterJobRoles'
      consumes 'application/vnd.api+json'
      security [basic: []]

      response '204', 'Job Role deleted successfully' do
        run_test! do
          expect { job_role.reload }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end
  end

  context 'Contract Validations' do
    let(:project_id) { project.id }

    describe 'Uniqueness validations' do
      let!(:existing_role) { create(:job_role, name: 'Duplicate', job_group: job_group) }
      let(:invalid_body) do
        {
          data: {
            type: 'job_roles',
            attributes: {
              name: 'Duplicate',
              description: 'Valid description',
              job_group_id: job_group.id
            }
          }
        }
      end

      it 'rejects duplicate names within same job group' do
        post '/api/v2/administration/job_roles', params: invalid_body, headers: headers
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['errors']).to include(
          a_hash_including('title' => 'A job role with the same name already exists.')
        )
      end
    end
  end
end
