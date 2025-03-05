# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::MembershipsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let(:client_admin) { create(:client_admin_membership) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/memberships/' do
    get 'Membership list' do
      operationId 'MembershipList'
      tags 'Membership'
      consumes 'application/json'
      security [basic: []]
      parameter name: :'filter[client_id_eq]', in: :query, required: true
      parameter name: :'filter[with_role]', in: :query, required: true

      response '200', ' list' do
        let!(:client_admin) { create(:client_admin_membership) }
        let(:'query[include_resource_meta]') { true }
        let(:'filter[with_role]') { 'client_admin' }
        let(:'filter[client_id_eq]') { client_admin.client_id.to_s }

        schema '$ref' => '#/components/schemas/MembershipListResponse'

        examples 'application/json' => [{
          type: 'memberships',
          data: {
            id: '12',
            attributes: {
              first_name: 'First Name',
              last_name: 'Last Name',
              email: 'user@cc.com',
              user_id: '2'
            },
            meta: {
              permissions: {
                login_as: true,
                edit: true,
                reset_password: true,
                remove: true,
                send_mail: true,
                export: true
              }
            }
          }
        }]

        run_test! do |response|
          response = JSON.parse(response.body)
          membership_response = response['data'].find { |d| d['id'] == client_admin.id.to_s }
          expect(response).to have_meta(
            'permissions' => {
              'edit' => true,
              'login_as' => true,
              'remove' => true,
              'reset_password' => true,
              'send_mail' => true,
              'export' => true
            }
          )
          expect(membership_response).to have_attribute(:first_name).with_value(client_admin.user.first_name)
          expect(membership_response).to have_attribute(:last_name).with_value(client_admin.user.last_name)
          expect(membership_response).to have_attribute(:email).with_value(client_admin.user.email)
          expect(membership_response).to have_attribute(:grant_names).with_value(client_admin.grants.data)
        end
      end
    end
  end

  path '/memberships/{membership_id}' do
    get 'Membership' do
      operationId 'Membership'
      description 'Fetch Membership'
      tags 'Memberships'
      consumes 'application/json'
      security [basic: []]
      parameter name: :membership_id, in: :path, type: :string

      response '200', 'Membership' do
        schema '$ref' => '#/components/schemas/MembershipResponse'

        examples 'application/json' => [{
          type: 'memberships',
          data: {
            id: '770',
            attributes: {
              first_name: 'First Name',
              last_name: 'Last Name',
              name: 'First Name Last Name',
              email: 'user@cc.com',
              role: 'client_admin',
              user_id: '1'
            },
            relationships: {
              user: {
                data: {
                  id: '1',
                  type: 'users'
                }
              }
            }
          }
        }]

        let(:membership_id) { client_admin.id }

        run_test! do |response|
          membership_response = JSON.parse(response.body)['data']
          expect(membership_response).to have_key('id')
          expect(membership_response).to have_attribute(:name).with_value(client_admin.user.name)
          expect(membership_response).to have_attribute(:first_name).with_value(client_admin.user.first_name)
          expect(membership_response).to have_attribute(:last_name).with_value(client_admin.user.last_name)
          expect(membership_response).to have_attribute(:client_id).with_value(client_admin.client_id)
          expect(membership_response).to have_attribute(:role).with_value(client_admin.role)
          expect(membership_response).to have_relationship(:user).
            with_data({ 'id' => client_admin.user_id.to_s, 'type' => 'users' })
        end
      end
    end
  end

  path '/memberships/' do
    post 'Create a membership' do
      operationId 'CreateMembership'
      description 'Create new Membership'
      tags 'Memberships'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/MembershipCreateRequest' },
                required: true

      response '201', 'Membership Created' do
        schema '$ref' => '#/components/schemas/MembershipResponse'

        examples 'application/json' => [{
          type: 'memberships',
          data: {
            id: '770',
            attributes: {
              first_name: 'First Name',
              last_name: 'Last Name',
              name: 'First Name Last Name',
              email: 'user@cc.com',
              role: 'client_admin',
              user_id: '1',
              clients: [
                {
                  id: 1,
                  name: 'Client Tenancy',
                  role: 'client_admin'
                }
              ],
              grants_names: {
                norms: %w[view manage],
                clients: %w[view view_licenses]
              }
            },
            relationships: {
              user: {
                data: {
                  id: '1',
                  type: 'users'
                }
              }
            }
          }
        }]

        let(:user) { create(:user) }
        let(:client) { create(:tenancy) }
        let(:body) do
          jsonapi_resource_request(
            'memberships',
            {
              user_id: [user.id.to_s],
              first_name: user.first_name,
              last_name: user.last_name,
              role: 'client_admin',
              client_id: client.id.to_s,
              grant_names: {
                clients: ['view']
              }
            }
          )
        end

        run_test! do |response|
          membership_response = JSON.parse(response.body)['data']
          expect(membership_response).to have_key('id')
          expect(membership_response).to have_attribute(:name).with_value(user.name)
          expect(membership_response).to have_attribute(:first_name).with_value(user.first_name)
          expect(membership_response).to have_attribute(:last_name).with_value(user.last_name)
          expect(membership_response).to have_attribute(:client_id).with_value(client.id)
          expect(membership_response).to have_attribute(:role).with_value('client_admin')
          expect(membership_response).to have_relationship(:user).
            with_data({ 'id' => user.id.to_s, 'type' => 'users' })
        end
      end
    end
  end

  path '/memberships/{membership_id}' do
    patch 'Update a membership' do
      operationId 'UpdateMembership'
      description 'Update Membership'
      tags 'Memberships'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :membership_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/MembershipUpdateRequest' },
                required: true

      response '200', 'Membership Updated' do
        schema '$ref' => '#/components/schemas/MembershipResponse'

        examples 'application/json' => [{
          type: 'memberships',
          data: {
            id: '770',
            attributes: {
              first_name: 'First Name',
              last_name: 'Last Name',
              name: 'First Name Last Name',
              email: 'user@cc.com',
              role: 'client_admin',
              user_id: '1',
              clients: [
                {
                  id: 1,
                  name: 'Client Tenancy',
                  role: 'client_admin'
                }
              ],
              grants_names: {
                norms: %w[view manage],
                clients: %w[view view_licenses]
              },
              admin_role_ids: [1]
            },
            relationships: {
              user: {
                data: {
                  id: '1',
                  type: 'users'
                }
              }
            }
          }
        }]

        let(:membership_id) { client_admin.id }
        let(:user) { client_admin.user }
        let(:admin_role) { create(:admin_role, client_id: client_admin.client_id) }
        let(:body) do
          jsonapi_resource_request(
            'memberships',
            {
              id: client_admin.id.to_s,
              email: client_admin.user.email,
              first_name: client_admin.user.first_name,
              last_name: client_admin.user.last_name,
              grant_names: {
                clients: %w[view view_licenses]
              },
              admin_role_ids: [admin_role.id]
            }
          )
        end

        run_test! do |response|
          membership_response = JSON.parse(response.body)['data']
          expect(membership_response).to have_key('id')
          expect(membership_response).to have_attribute(:first_name).with_value(user.first_name)
          expect(membership_response).to have_attribute(:last_name).with_value(user.last_name)
          expect(membership_response).to have_attribute(:email).with_value(user.email)
          expect(membership_response).to have_attribute(:admin_role_ids).with_value([admin_role.id])
        end
      end
    end
  end

  path '/memberships/export' do
    post 'Export admin members' do
      operationId 'MembershipList'
      tags 'Membership'
      consumes 'application/json'
      security [basic: []]
      parameter name: :'filter[client_id_eq]', in: :query, required: false
      parameter name: :'filter[project_id_eq]', in: :query, required: false
      parameter name: :'filter[campaign_id_eq]', in: :query, required: false
      parameter name: :'filter[with_role]', in: :query, required: true
      parameter name: :body, in: :body, required: true

      response '200', 'creates export with permission job for client' do
        examples 'application/json' => {
          type: 'memberships',
          data: {
            attributes: {
              client_id: 1
            }
          }
        }

        let!(:client_admin) { create(:client_admin_membership) }
        let(:'filter[with_role]') { 'client_admin' }
        let(:'filter[client_id_eq]') { client_admin.client_id }
        let(:body) do
          jsonapi_resource_request(
            'memberships',
            {
              client_id: client_admin.client_id
            }
          )
        end

        run_test! do
          expect(AdminJobRecord.last.operation).to eq('export_admin_with_permissions')
          expect(AdminJobRecord.last.data).to eq({ 'client_id' => client_admin.client_id })
        end
      end

      response '200', 'creates admin export with permission job for project' do
        examples 'application/json' => {
          type: 'memberships',
          data: {
            attributes: {
              project_id: 1
            }
          }
        }

        let!(:project) { create(:project) }
        let!(:project_admin) { create(:project_admin, project: project) }
        let(:'filter[with_role]') { 'project_admin' }
        let(:'filter[project_id_eq]') { project.id }
        let(:body) do
          jsonapi_resource_request(
            'memberships',
            {
              project_id: project.id
            }
          )
        end

        run_test! do
          expect(AdminJobRecord.last.operation).to eq('export_admin_with_permissions')
          expect(AdminJobRecord.last.data).to eq({ 'project_id' => project.id })
        end
      end

      response '200', 'creates admin export with permission job for campaign' do
        examples 'application/json' => {
          type: 'memberships',
          data: {
            attributes: {
              campaign_id: 1
            }
          }
        }

        let(:campaign) { create(:campaign) }
        let!(:campaign_admin) { create(:campaign_admin, campaign: campaign) }
        let(:'filter[with_role]') { 'campaign_admin' }
        let(:'filter[project_id_eq]') { campaign.project_id }
        let(:'filter[campaign_id_eq]') { campaign.id }
        let(:body) do
          jsonapi_resource_request(
            'memberships',
            {
              campaign_id: campaign.id
            }
          )
        end

        run_test! do
          expect(AdminJobRecord.last.operation).to eq('export_admin_with_permissions')
          expect(AdminJobRecord.last.data).to eq({ 'campaign_id' => campaign.id })
        end
      end
    end
  end
end
