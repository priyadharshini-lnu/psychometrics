# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ProjectsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:client) { create(:tenancy) }
  let!(:client_id) { client.id }
  let!(:project) { create(:project, parent: client, subdomain: 'project-subdomain') }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

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
end
