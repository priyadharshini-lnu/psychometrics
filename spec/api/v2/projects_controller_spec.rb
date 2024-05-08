# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ProjectsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:project_admin) { create(:user, project: project, role: 'Users::Admin') }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }
  let!(:campaign) { create(:campaign) }
  let!(:project) { campaign.project }
  let!(:client) { project.client }
  let!(:client_id) { client.id }
  let!(:project_membership) { create(:project_admin_membership, user: project_admin, client: project) }
  before { sign_in(project_admin) }

  path '/clients/{client_id}/projects/' do
    get 'Project List' do
      operationId 'ProjectsList'
      description 'Fetch Projects list'

      tags 'Project'
      consumes 'application/json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string

      response '200', 'Project list' do
        schema '$ref' => '#/components/schemas/ProjectsListResponse'

        examples 'application/json' => [{
          type: 'projects',
          data: {
            id: '770',
            attributes: {
              name: 'Project Name',
              created_at: '01 Oct 2019 / 17:36',
              updated_at: '02 Oct 2019 / 17:36',
              locales: ['en'],
              logo: 'https://dummy_bucket.s3.amazonaws.com/uploads/client/logo/1005/8845148b-2404-48b7-9cbc-9f90e088341c.png',
              number: 'TTE-2022',
              subdomain: 'project-subdomain'
            }
          }
        }]

        run_test! do |response|
          clients = JSON.parse(response.body)
          client_response = clients['data'].find { |c| c['id'] == project.id.to_s }
          expect(client_response).to have_key('id')
          expect(client_response).to have_attribute(:name).with_value(project.name)
        end
      end
    end
  end

  path '/clients/{client_id}/projects/' do
    post 'Create a Project' do
      operationId 'CreateProject'
      description 'Create new Project'
      tags 'Projects'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :body, in: :body,
                schema: { '$ref' => '#/components/schemas/ProjectCreateRequest' },
                required: true

      response '201', 'Project Created' do
        schema '$ref' => '#/components/schemas/ProjectResponse'
        examples 'application/json' => {
          data: {
            type: 'projects',
            attributes: {
              name: 'Project Name',
              subdomain: 'project-subdomain',
              number: '123'
            }
          }
        }

        let(:body) do
          {
            data: {
              type: 'projects',
              attributes: {
                name: 'Project Name',
                subdomain: 'project-subdomain-12345',
                number: '123'
              }
            }
          }
        end

        before { sign_in(superadmin) }

        run_test! do |response|
          client_response = JSON.parse(response.body)['data']
          expect(client_response).to have_key('id')
          expect(client_response).to have_attribute(:name).with_value('Project Name')
        end
      end
    end
  end

  path '/clients/{client_id}/projects/' do
    patch 'Update a project' do
      operationId 'UpdateProject'
      description 'Update a project'
      tags 'Clients'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :body,
                in: :body,
                schema: { '$ref' => '#/components/schemas/ProjectUpdateRequest' },
                required: true

      response '200', 'Client Updated' do
        schema '$ref' => '#/components/schemas/ProjectResponse'
        examples 'application/json' => {
          data: {
            type: 'projects',
            id: '20',
            attributes: {
              disabled: true
            }
          }
        }

        let(:body) do
          {
            data: {
              type: 'projects',
              id: project.id.to_s,
              attributes: {
                disabled: true
              }
            }
          }
        end
      end
    end
  end

  path '/projects/{project_id}/seach_user' do
    get 'Project Users list' do
      operationId 'ProjectUserslist'
      description 'Fetch Projects users list'

      tags 'ProjectUsers'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string, required: true
      parameter name: :'filter[search_query]', in: :query

      response '200', 'Projects users list' do
        let!(:project_id) { project.id }
        let!(:user) { create(:user, project: project) }
        let(:'filter[search_query]') { 'test' }

        run_test! do |response|
          users = JSON.parse(response.body)

          users_response = users['data'].find { |u| u['id'] == user.id.to_s }
          expect(users_response).to have_key('id')
          expect(users_response).to have_attribute(:name).with_value(user.name)
        end
      end
    end
  end

  path '/projects/{project_id}/add_manager' do
    put 'Add manager to User' do
      operationId 'AddManager'
      description 'Add manager to user'

      tags 'AddManager'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string, required: true
      parameter name: :user_id, in: :query, type: :string, required: true
      parameter name: :manager_id, in: :query, type: :string, required: true

      response '200', 'Add manager to user' do
        let!(:user) { create(:user, project: project) }
        let!(:manager) { create(:user, project: project) }

        let!(:project_id) { project.id }
        let!(:user_id) { user.id }
        let!(:manager_id) { manager.id }

        run_test! do |response|
          manager_response = JSON.parse(response.body)['data']
          expect(manager_response).to have_key('id')
          expect(manager_response).to have_attribute(:email).with_value(manager.email)
          expect(manager_response).to have_attribute(:name).with_value(manager.decorate.full_name)
        end
      end

      response '422', 'Unprocessable Entity' do
        let!(:other_project) { create(:project) }
        let!(:manager) { create(:user, project: other_project) }
        let!(:project_id) { project.id }
        let!(:user_id) { 9999 }
        let!(:manager_id) { manager.id }

        run_test! do |response|
          errors = JSON.parse(response.body)['errors']

          expect(errors.first['title']).to eq('Manager not found or not part of the same project')
          expect(errors.second['title']).to eq('User not found or not part of the same project')
        end
      end
    end
  end
end
