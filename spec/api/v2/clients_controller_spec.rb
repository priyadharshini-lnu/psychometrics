# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ClientsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:membership) { create(:client_admin_membership) }
  let!(:client) { create(:tenancy) }
  let!(:include_resource_meta) { 'permissions' }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/clients/' do
    get 'Clients List' do
      operationId 'ClientsList'

      description 'Fetch Clients list'
      tags 'Clients'
      consumes 'application/json'
      security [basic: []]
      parameter name: :include_resource_meta, in: :query, required: true

      response '200', 'Client list' do
        schema '$ref' => '#/components/schemas/ClientsListResponse'

        examples 'application/json' => [{
          type: 'clients',
          data: {
            id: '770',
            attributes: {
              name: 'Client Name',
              type: 'Partner',
              year: 2021,
              location: 'UAE',
              project_manager: {
                id: '1',
                name: 'John Doe'
              }
            },
            meta: {
              permissions: {
                view_licenses: true
              }
            }
          }
        }]

        run_test! do |response|
          clients = JSON.parse(response.body)
          client_response = clients['data'].find { |c| c['id'] == client.id.to_s }
          expect(client_response).to have_key('id')
          expect(client_response).to have_attribute(:name).with_value(client.name)
          expect(client_response).to have_relationship(:project_manager).
            with_data({ 'id' => client.project_manager_id.to_s, 'type' => 'users' })
        end
      end
    end
  end

  path '/clients/' do
    post 'Create a client' do
      operationId 'CreateClient'
      description 'Create new Client'
      tags 'Clients'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ClientCreateRequest' }, required: true
      parameter name: :include_resource_meta, in: :query, required: true

      response '201', 'Client Created' do
        schema '$ref' => '#/components/schemas/ClientResponse'
        examples 'application/json' => {
          data: {
            type: 'clients',
            attributes: {
              name: 'Client Name',
              year: '2020',
              type: 'partner',
              country: 'India',
              number: '123'
            },
            relationships: {
              project_manager: {
                data: {
                  type: 'users',
                  id: '100'
                }
              }
            },
            meta: {
              permissions: {
                view_licenses: true
              }
            }
          }
        }

        let(:project_manager) { create(:client_admin) }
        let(:body) do
          {
            data: {
              type: 'clients',
              attributes: {
                name: 'Client 1',
                year: Time.zone.now.year,
                type: 'partner',
                country: 'India',
                number: '123'
              },
              relationships: {
                project_manager: {
                  data: {
                    type: 'users',
                    id: project_manager.id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          client_response = JSON.parse(response.body)['data']
          expect(client_response).to have_key('id')
          expect(client_response).to have_attribute(:name).with_value('Client 1')
          expect(client_response).to have_attribute(:year).with_value(Time.zone.now.year)
          expect(client_response).to have_attribute(:type).with_value('partner')
          expect(client_response).to have_attribute(:number).with_value('123')
          expect(client_response).to have_relationship(:project_manager).
            with_data({ 'id' => project_manager.id.to_s, 'type' => 'users' })
        end
      end
    end
  end

  path '/clients/{client_id}' do
    patch 'Update a client' do
      operationId 'UpdateClient'
      description 'Update a Client'
      tags 'Clients'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :include_resource_meta, in: :query, required: true
      parameter name: :client_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ClientUpdateRequest' }, required: true

      response '200', 'Client Updated' do
        schema '$ref' => '#/components/schemas/ClientResponse'
        examples 'application/json' => {
          data: {
            type: 'clients',
            id: '20',
            attributes: {
              name: 'Client Name',
              year: '2020',
              type: 'partner',
              country: 'India',
              number: '123'
            },
            relationships: {
              project_manager: {
                data: {
                  type: 'users',
                  id: '100'
                }
              }
            },
            meta: {
              permissions: {
                view_licenses: true
              }
            }
          }
        }

        let(:client) { create(:tenancy, name: 'Old Name', type: 'partner') }
        let(:client_id) { client.id }
        let(:project_manager) { create(:client_admin) }

        let(:body) do
          {
            data: {
              type: 'clients',
              id: client.id.to_s,
              attributes: {
                name: 'New Name',
                type: 'retail'
              },
              relationships: {
                project_manager: {
                  data: {
                    type: 'users',
                    id: project_manager.id.to_s
                  }
                }
              }
            }
          }
        end

        run_test! do |response|
          client_response = JSON.parse(response.body)['data']
          expect(client_response).to have_key('id')
          expect(client_response).to have_attribute(:name).with_value('New Name')
          expect(client_response).to have_attribute(:type).with_value('retail')
          expect(client_response).to have_attribute(:number).with_value(client.number)
          expect(client_response).to have_relationship(:project_manager).
            with_data({ 'id' => project_manager.id.to_s, 'type' => 'users' })
        end
      end
    end

    delete 'Delete a client' do
      operationId 'DeleteClient'
      description 'Delete a Client'
      tags 'Clients'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string

      let(:client) { create(:tenancy) }
      let(:client_id) { client.id }

      response '204', 'Client Deleted' do
        run_test! do |response|
          expect(response.body).to be_empty
          expect(Client.find_by(id: client_id)).to eq(nil)
        end
      end
    end
  end
end
