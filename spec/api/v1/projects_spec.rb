# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe 'Projects' do
  let!(:membership) { create(:client_admin_membership) }
  let!(:project) { create(:project, parent: membership.client) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

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
          'id': 770,
          'client_id': 1,
          'name': 'Project 1',
          'subdomain': 'xyz',
          'client_reference': 'XYZ 001',
          'locales': %w[en ar],
          'data_processing_consent': true,
          'enable_strong_password': true,
          'enable_2factor_auth': true,
          'project_logo_url': 'base64image',
          'partner_logo_url': 'base64image',
          'background_image_url': 'base64image',
          'background_color': '#ffffff',
          'login_box_position': 'left',
          'webhook': 'https://my.site.com',
          'created_at': '2019-03-05T10:56:53.349+04:00',
          'updated_at': '2019-03-05T10:56:53.349+04:00'
        }

        let(:body) do
          {
            subdomain: 'asd',
            client_id: membership.client.id,
            locales: ['en'],
            background_color: '#cccccc',
            webhook: 'https://my.site.com',
            login_box_position: 'right',
            name: 'project1',
            data_processing_consent: true
          }
        end

        run_test! do |response|
          project = JSON.parse(response.body)
          expect(project).to have_key('id')
          expect(project['data_processing_consent']).to eq true
          expect(project['name']).to eq 'project1'
          expect(project['client_id']).to eq membership.client.id
          expect(project['webhook']).to eq 'https://my.site.com'
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
          'id': 770,
          'name': 'Project 1',
          'client_id': 1,
          'subdomain': 'xyz',
          'client_reference': 'XYZ 001',
          'locales': %w[en ar],
          'data_processing_consent': true,
          'enable_strong_password': true,
          'enable_2factor_auth': true,
          'background_color': '#ffffff',
          'project_logo_url': 'url_to_logo',
          'partner_logo_url': 'url_to_logo',
          'background_image_url': 'url_to_image',
          'login_box_position': 'left',
          'webhook': 'https://my.site.com',
          'created_at': '2019-03-05T10:56:53.349+04:00',
          'updated_at': '2019-03-05T10:56:53.349+04:00'
        }

        let(:body) do
          {
            subdomain: 'new',
            name: 'newname',
            webhook: 'https://my.site.com'
          }
        end

        let(:project_id) { project.id }

        run_test! do |response|
          project = JSON.parse(response.body)
          expect(project['name']).to eq 'newname'
          expect(project['subdomain']).to eq 'new'
          expect(project['webhook']).to eq 'https://my.site.com'
        end
      end
    end
  end
end
