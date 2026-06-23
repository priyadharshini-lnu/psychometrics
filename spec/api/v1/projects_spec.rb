# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe 'Projects' do
  let!(:membership) { create(:client_admin_membership, :with_application_user) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:user) { create(:user, project: project) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { create(:api_key, token: 'token', key: 'key', user: membership.user) }

  path '/projects/' do
    post 'Create a project' do
      operationId 'CreateProject'
      description 'Create new project'
      tags 'Projects'
      consumes 'application/json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/NewProject' }, required: true

      response '200', 'Project created' do
        schema '$ref' => '#/definitions/Project'
        examples 'application/json' => {
          id: 770,
          client_id: 1,
          name: 'Project 1',
          subdomain: 'xyz',
          client_reference: 'XYZ 001',
          locales: %w[en ar],
          data_processing_consent: true,
          enable_strong_password: true,
          enable_2factor_auth: true,
          project_logo_url: 'base64image',
          partner_logo_url: 'base64image',
          background_image_url: 'base64image',
          background_color: '#ffffff',
          login_box_position: 'left',
          webhook: 'https://my.site.com',
          created_at: '2019-03-05T10:56:53.349+04:00',
          updated_at: '2019-03-05T10:56:53.349+04:00'
        }

        let(:body) do
          {
            subdomain: 'asd',
            client_id: membership.client.id,
            locales: ['en'],
            background_color: '#cccccc',
            webhook: 'https://my.site.com',
            name: 'project1',
            login_box_position: 'right',
            enable_strong_password: true,
            enable_2factor_auth: true,
            data_processing_consent: true,
            logo_alt_text: 'alt text',
            secondary_logo_alt_text: 'alt text'
          }
        end

        run_test! do |response|
          project = JSON.parse(response.body)

          expect(project).to have_key('id')
          expect(project['data_processing_consent']).to eq true
          expect(project['name']).to eq 'project1'
          expect(project['client_id']).to eq membership.client.id
          expect(project['webhook']).to eq 'https://my.site.com'
          expect(project['logo_alt_text']).to eq 'alt text'
          expect(project['secondary_logo_alt_text']).to eq 'alt text'
        end
      end
    end
  end

  path '/projects/{project_id}' do
    put 'Update a project' do
      operationId 'UpdateProject'
      description 'Update a project'
      tags 'Projects'
      consumes 'application/json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/UpdatedProject' }, required: true
      parameter name: :project_id, in: :path, type: :string

      response '400', 'Webhook update failure' do
        schema '$ref' => '#/definitions/Project'
        examples 'application/json' => {
          id: 770,
          name: 'Project 1',
          client_id: 1,
          subdomain: 'xyz',
          client_reference: 'XYZ 001',
          locales: %w[en ar],
          data_processing_consent: true,
          enable_strong_password: true,
          enable_2factor_auth: true,
          background_color: '#ffffff',
          project_logo_url: 'url_to_logo',
          partner_logo_url: 'url_to_logo',
          background_image_url: 'url_to_image',
          login_box_position: 'left',
          webhook: 'https://my.site.com',
          created_at: '2019-03-05T10:56:53.349+04:00',
          updated_at: '2019-03-05T10:56:53.349+04:00'
        }

        let(:body) do
          {
            subdomain: 'new',
            name: 'newname',
            webhook: 'https://my.site.com',
            background_color: '#000000',
            login_box_position: 'center'
          }
        end

        let(:project_id) { project.id }
        let!(:webhook) { create(:webhook, project_id: project_id) }
        let!(:webhook1) { create(:webhook, project_id: project_id) }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1002,
            'message' => 'Validation error',
            'more_info' => "Webhook url can't be updated as there are multiple webhook for this project.",
            'meta' => nil
          )
        end
      end
    end
  end

  path '/projects/{project_id}' do
    put 'Update a project' do
      operationId 'UpdateProject'
      description 'Update a project'
      tags 'Projects'
      consumes 'application/json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/definitions/UpdatedProject' }, required: true
      parameter name: :project_id, in: :path, type: :string

      response '200', 'Project updated' do
        schema '$ref' => '#/definitions/Project'
        examples 'application/json' => {
          id: 770,
          name: 'Project 1',
          client_id: 1,
          subdomain: 'xyz',
          client_reference: 'XYZ 001',
          locales: %w[en ar],
          data_processing_consent: true,
          enable_strong_password: true,
          enable_2factor_auth: true,
          background_color: '#ffffff',
          project_logo_url: 'url_to_logo',
          partner_logo_url: 'url_to_logo',
          background_image_url: 'url_to_image',
          login_box_position: 'left',
          webhook: 'https://my.site.com',
          created_at: '2019-03-05T10:56:53.349+04:00',
          updated_at: '2019-03-05T10:56:53.349+04:00'
        }

        let(:body) do
          {
            subdomain: 'new',
            name: 'newname',
            webhook: 'https://my.site.com',
            background_color: '#000000',
            login_box_position: 'center',
            logo_alt_text: 'alt text',
            secondary_logo_alt_text: 'alt text'
          }
        end

        let(:project_id) { project.id }

        run_test! do |response|
          project = JSON.parse(response.body)
          expect(project['name']).to eq 'newname'
          expect(project['subdomain']).to eq 'new'
          expect(project['background_color']).to eq '#000000'
          expect(project['login_box_position']).to eq 'auto'
          expect(project['webhook']).to eq 'https://my.site.com'
          expect(project['logo_alt_text']).to eq 'alt text'
          expect(project['secondary_logo_alt_text']).to eq 'alt text'
        end
      end
    end
  end

  path '/projects/{project_id}' do
    get 'Get a project' do
      operationId 'GetProject'
      description 'Get a project'
      tags 'Projects'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string

      response '200', 'Project Getd' do
        schema '$ref' => '#/definitions/Project'
        examples 'application/json' => {
          id: 770,
          name: 'Project 1',
          client_id: 1,
          subdomain: 'xyz',
          client_reference: 'XYZ 001',
          locales: %w[en ar],
          data_processing_consent: true,
          enable_strong_password: true,
          enable_2factor_auth: true,
          background_color: '#ffffff',
          project_logo_url: 'url_to_logo',
          partner_logo_url: 'url_to_logo',
          background_image_url: 'url_to_image',
          login_box_position: 'left',
          webhook: 'https://my.site.com',
          created_at: '2019-03-05T10:56:53.349+04:00',
          updated_at: '2019-03-05T10:56:53.349+04:00'
        }

        let(:project_id) { project.id }

        run_test! do |response|
          project = JSON.parse(response.body)
          expect(project['id']).to eq project_id
        end
      end
    end
  end

  path '/projects/{project_id}/users' do
    get 'Get a user' do
      operationId 'GetUser'
      tags 'Projects'
      description 'Get a user by email.'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string, required: true
      parameter name: :email, in: :query, type: :string, required: true
      parameter name: :datasheet, in: :query, type: :boolean, required: false,
                description: 'If true, returns project datasheet and campaign datasheets'

      response '200', 'User info' do
        schema '$ref' => '#/definitions/GetUser'
        examples 'application/json' => {
          id: 14_602,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          created_at: '2019-03-04T15:47:33.570+04:00',
          updated_at: '2019-03-04T15:47:33.950+04:00',
          campaign_ids: [
            510
          ]
        }

        let(:email) { user.email }
        let(:project_id) { project.id }

        run_test! do |response|
          body = JSON.parse(response.body)
          expect(body['email']).to eq user.email
        end
      end

      response '404', 'User was not found' do
        let(:email) { 'ttt@example.com' }
        let(:project_id) { project.id }

        schema '$ref' => '#/definitions/ApiError'

        examples 'application/json' => {
          code: 1005,
          message: 'Resource not found',
          more_info: 'User with email=ttt@example.com was not found',
          meta: nil
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1005,
            'message' => 'Resource not found',
            'more_info' => 'User with email=ttt@example.com was not found',
            'meta' => nil
          )
        end
      end
    end
  end

  path '/clients/{client_id}/projects' do
    get 'Get projects for a client' do
      operationId 'GetClientProjects'
      description 'Get projects associated with a client'
      tags 'Projects'
      consumes 'application/json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string

      response '200', 'Success' do
        schema type: 'array', items: { '$ref' => '#/definitions/Project' }
        examples 'application/json' => [
          {
            id: 367,
            name: 'Project 1',
            subdomain: 'xyz',
            client_reference: 'XYZ 001',
            created_at: '2018-02-11T10:55:25.569+04:00',
            updated_at: '2018-02-11T10:55:25.569+04:00'
          }
        ]

        let!(:client_id) { membership.client.id }
        let!(:client_project) { create(:project, parent: membership.client) }
        let!(:other_project) { create(:project) }

        run_test! do |response|
          projects = JSON.parse(response.body)
          expect(projects.length).to eq(2)
          expect(projects.pluck('id')).to match_array([client_project.id, project.id])
          expect(projects.pluck('id')).not_to include(other_project.id)
        end
      end

      response '401', 'Authentication error' do
        let(:client_id) { '1' }
        let(:Authorization) { "Basic #{Base64.strict_encode64('key:wrong_token')}" }

        schema '$ref' => '#/definitions/ApiError'
        examples 'application/json' => {
          code: 1000,
          message: 'Invalid authentication',
          more_info: nil,
          meta: nil
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1000,
            'message' => 'Invalid authentication',
            'more_info' => nil,
            'meta' => nil
          )
        end
      end

      response '404', 'Client not found' do
        let(:client_id) { 'invalid' }

        schema '$ref' => '#/definitions/ApiError'
        examples 'application/json' => {
          code: 1005,
          message: 'Resource not found',
          more_info: 'Client with id=invalid is not found',
          meta: nil
        }

        run_test! do |response|
          error = JSON.parse(response.body)
          expect(error).to eq(
            'code' => 1005,
            'message' => 'Resource not found',
            'more_info' => 'Client with id=invalid is not found',
            'meta' => nil
          )
        end
      end
    end
  end
end
