# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ClientsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:membership) { create(:client_admin_membership) }
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, parent: membership.client) }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/clients/' do
    get 'Clients List' do
      operationId 'ClientsList'
      description 'Fetch Clients list'
      tags 'Clients'
      consumes 'application/json'
      security [basic: []]

      response '200', 'Client list' do
        schema '$ref' => '#/components/schemas/ClientsListResponse'

        examples 'application/json' => [{
          type: 'clients',
          data: {
            'id': '770',
            attributes: {
              'name': 'Client Name',
              'type': 'Partner',
              'year': 2021,
              'location': 'UAE',
              'account_manager': {
                'id': '1',
                'name': 'John Doe'
              },
              'project_manager': {
                'id': '1',
                'name': 'John Doe'
              }
            }
          }
        }]

        run_test! do |response|
          clients = JSON.parse(response.body)
          client_response = clients['data'].find { |c| c['id'] == client.id.to_s }
          expect(client_response).to have_key('id')
          expect(client_response).to have_attribute(:name).with_value(client.name)
          expect(client_response).to have_relationship(:account_manager).
            with_data({ 'id' => client.account_manager_id.to_s, 'type' => 'users' })
          expect(client_response).to have_relationship(:project_manager).
            with_data({ 'id' => client.project_manager_id.to_s, 'type' => 'users' })
        end
      end
    end
  end
end
