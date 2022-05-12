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
            'id': 770,
            attributes: {
              'name': 'Client 1',
              'type': 'Partner',
              'year': 2021,
              'location': 'Belarus'
            }
          }
        }]

        run_test! do |response|
          clients = JSON.parse(response.body)
          expect(clients['data'].first).to have_key('id')
          expect(clients['data'].first['attributes']['name']).to eq('Client Tenancy 1')
        end
      end
    end
  end
end
