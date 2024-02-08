# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::AdminRolesController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }
  let!(:client) { create(:tenancy) }
  let!(:admin_role) { create(:admin_role, client_id: client.id) }
  let(:client_id) { client.id }
  let(:admin_role_id) { admin_role.id }

  before { sign_in(superadmin) }

  path '/clients/{client_id}/admin_roles' do
    get 'Admin Roles list' do
      operationId 'AdminRolesList'
      tags 'AdminRoles'
      consumes 'application/json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string

      response '200', ' list' do
        schema '$ref' => '#/components/schemas/AdminRolesListResponse'

        examples 'application/json' => [{
          data: {
            id: '1',
            type: 'admin_roles',
            attributes: {
              name: 'Role name',
              description: 'Role description',
              client_id: '1',
              permissions: nil
            }
          }
        }]

        run_test! do |response|
          admin_role_response = JSON.parse(response.body)['data'].find { |d| d['id'] == admin_role.id.to_s }
          expect(admin_role_response).to have_attribute(:name).with_value(admin_role.name)
          expect(admin_role_response).to have_attribute(:description).with_value(admin_role.description)
          expect(admin_role_response).to have_attribute(:client_id).with_value(client_id)
        end
      end
    end

    post 'Create Admin Role' do
      operationId 'CreateAdminRole'
      description 'Create new Admin Role'
      tags 'AdminRoles'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/AdminRoleCreateRequest' },
                required: true

      response '201', 'Admin Role Created' do
        schema '$ref' => '#/components/schemas/AdminRoleResponse'

        examples 'application/json' => [{
          data: {
            id: '1',
            type: 'admin_roles',
            attributes: {
              name: 'Role name',
              description: 'Role description',
              client_id: '1',
              permissions: nil
            }
          }
        }]

        let(:body) do
          {
            data: {
              type: 'admin_roles',
              attributes: {
                name: 'Role Name',
                description: 'Admin Role description',
                client_id: client_id
              }
            }
          }
        end

        run_test! do |response|
          admin_role_response = JSON.parse(response.body)['data']
          expect(admin_role_response).to have_key('id')
          expect(admin_role_response).to have_attribute(:name).with_value('Role Name')
          expect(admin_role_response).to have_attribute(:description).with_value('Admin Role description')
        end
      end
    end
  end

  path '/clients/{client_id}/admin_roles/{admin_role_id}' do
    get 'Admin Role' do
      operationId 'AdminRole'
      description 'Fetch Admin Role'
      tags 'AdminRoles'
      consumes 'application/json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :admin_role_id, in: :path, type: :string

      response '200', 'Admin Role' do
        schema '$ref' => '#/components/schemas/AdminRoleResponse'

        examples 'application/json' => [{
          data: {
            id: '1',
            type: 'admin_roles',
            attributes: {
              name: 'Role name',
              description: 'Role description',
              client_id: '1',
              permissions: nil
            }
          }
        }]

        run_test! do |response|
          admin_role_response = JSON.parse(response.body)['data']
          expect(admin_role_response).to have_key('id')
          expect(admin_role_response).to have_attribute(:name).with_value(admin_role.name)
          expect(admin_role_response).to have_attribute(:description).with_value(admin_role.description)
          expect(admin_role_response).to have_attribute(:client_id).with_value(client_id)
        end
      end
    end

    patch 'Update an Admin Role' do
      operationId 'UpdateAdminRole'
      description 'Update Admin Role'
      tags 'AdminRoles'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :admin_role_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/AdminRoleUpdateRequest' },
                required: true

      response '200', 'Admin Role Updated' do
        schema '$ref' => '#/components/schemas/AdminRoleResponse'

        examples 'application/json' => [{
          data: {
            id: '1',
            type: 'admin_roles',
            attributes: {
              name: 'Role name',
              description: 'Role description',
              client_id: '1',
              permissions: nil
            }
          }
        }]

        let(:body) do
          jsonapi_resource_request(
            'admin_roles',
            {
              id: admin_role.id.to_s,
              name: 'Updated Role Name',
              permissions: { 'clients' => ['view'] }
            }
          )
        end

        run_test! do |response|
          admin_role_response = JSON.parse(response.body)['data']
          expect(admin_role_response).to have_key('id')
          expect(admin_role_response).to have_attribute(:name).with_value('Updated Role Name')
          expect(admin_role_response).to have_attribute(:permissions).with_value({ 'clients' => ['view'] })
        end
      end
    end

    delete 'Delete Admin Role' do
      operationId 'DeleteAdminRole'
      description 'Delete Admin Role'
      tags 'AdminRoles'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string
      parameter name: :admin_role_id, in: :path, type: :string

      response '204', 'Admin Role Deleted' do
        run_test! do |response|
          expect(response.body).to be_empty
          expect(AdminRole.find_by(id: admin_role_id)).to eq(nil)
        end
      end
    end
  end
end
