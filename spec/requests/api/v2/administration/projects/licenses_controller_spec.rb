# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::Projects::LicensesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, parent: client) }
  let!(:license) { create(:license, client: client, is_project_specific: true) }
  let!(:project_license) do
    create(:project_license, project: project, license: license, usage_limit: 10, used_number: 5)
  end
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/projects/{project_id}/licenses' do
    get 'Project Licenses List' do
      operationId 'ProjectLicensesList'
      description 'Fetch project Licenses list'
      tags 'Projects Licenses'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string

      response '200', 'Project Licenses list' do
        let(:project_id) { project.id.to_s }

        run_test! do |response|
          licenses = JSON.parse(response.body)
          license_response = licenses['data'].find { |c| c['id'] == license.id.to_s }

          expect(license_response['attributes']['number']).to eq(license.number)
          expect(license_response['attributes']['overuse_number']).to eq(license.overuse_number)
          expect(license_response['attributes']['project_license_details']['id']).to eq(project_license.id)
          expect(license_response['attributes']['project_license_details']['usage_limit']).
            to eq(project_license.usage_limit)
        end
      end
    end

    post 'Create Project License' do
      operationId 'createProjectLicense'
      description 'Create a project license'
      tags 'Projects Licenses'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :params, in: :body, schema: {
        type: :object,
        properties: {
          data: {
            type: :object,
            properties: {
              type: { type: :string, default: 'icenses' },
              attributes: {
                type: :object,
                properties: {
                  license_id: { type: :integer },
                  usage_limit: { type: :integer },
                  enabled: { type: :boolean }
                },
                required: %w[license_id usage_limit enabled]
              }
            },
            required: %w[type attributes]
          }
        },
        required: ['data']
      }

      response '201', 'Project License created' do
        let(:project_id) { project.id.to_s }
        let(:new_license) { create(:license, client: client, is_project_specific: true) }
        let(:params) do
          {
            data: {
              type: 'licenses',
              attributes: {
                license_id: new_license.id,
                usage_limit: 20,
                enabled: true
              }
            }
          }
        end

        run_test! do |response|
          expect(response).to have_http_status(:created)
          project_license = ProjectLicense.last
          expect(project_license.license_id).to eq(new_license.id)
          expect(project_license.usage_limit).to eq(20)
          expect(project_license.enabled).to be_truthy
        end
      end
    end
  end

  path '/projects/{project_id}/licenses/{id}' do
    let(:id) { project_license.id }
    let(:project_id) { project.id }

    put 'Update Project License' do
      operationId 'updateProjectLicense'
      description 'Update a project license'
      tags 'Projects Licenses'
      consumes 'application/json'
      security [basic: []]
      parameter name: :project_id, in: :path, type: :string
      parameter name: :id, in: :path, type: :string
      parameter name: :params, in: :body, schema: {
        type: :object,
        properties: {
          data: {
            type: :object,
            properties: {
              type: { type: :string, default: 'licenses' },
              id: { type: :string },
              attributes: {
                type: :object,
                properties: {
                  usage_limit: { type: :integer },
                  enabled: { type: :boolean }
                }
              }
            },
            required: %w[type id attributes]
          }
        },
        required: ['data']
      }

      response '200', 'Project License updated' do
        let(:params) do
          {
            data: {
              type: 'licenses',
              id: project_license.id.to_s,
              attributes: {
                usage_limit: 25,
                enabled: false
              }
            }
          }
        end

        run_test! do |response|
          expect(response).to have_http_status(:ok)
          project_license.reload
          expect(project_license.usage_limit).to eq(25)
          expect(project_license.enabled).to be_falsey
        end
      end

      response '422', 'Cannot set usage_limit greater than parent license number' do
        let!(:parent_license) { create(:license, client: client, number: 5, is_project_specific: true) }
        let!(:project_license) do
          create(:project_license, license: parent_license, project: project, usage_limit: 2, used_number: 0)
        end

        let(:params) do
          {
            data: {
              type: 'licenses',
              id: project_license.id.to_s,
              attributes: {
                usage_limit: 10
              }
            }
          }
        end

        run_test! do |response|
          expect(response).to have_http_status(:unprocessable_entity)
          body = JSON.parse(response.body)
          expect(body['errors']).to be_present
        end
      end

      response '422', 'Cannot reduce usage_limit below used number' do
        let!(:project_license) do
          create(:project_license, license: license, project: project, usage_limit: 5, used_number: 4)
        end

        let(:params) do
          {
            data: {
              type: 'licenses',
              id: project_license.id.to_s,
              attributes: {
                usage_limit: 2
              }
            }
          }
        end

        run_test! do |response|
          expect(response).to have_http_status(:unprocessable_entity)
          body = JSON.parse(response.body)
          expect(body['errors']).to be_present
        end
      end
    end
  end
end
