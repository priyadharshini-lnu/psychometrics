# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ClientPrivacySettingsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:client) { create(:tenancy) }
  let!(:client_privacy_setting) { create(:client_privacy_setting, client: client) }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/clients/{client_id}/client_privacy_settings' do
    get 'Fetch Client Privacy Settings' do
      operationId 'getClientPrivacySettings'
      description 'Retrieve Client Privacy Settings'
      tags 'ClientPrivacySettings'
      consumes 'application/json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string, required: true
      parameter name: :'filter[client_id_eq]', in: :query, required: true

      response '200', 'Client Privacy Settings found' do
        schema '$ref' => '#/components/schemas/ClientPrivacySettingListResponse'

        let(:client_id) { client.id }
        let!(:'filter[client_id_eq]') { client.id }

        run_test! do |response|
          expect(response).to have_http_status(:ok)
          json_response = JSON.parse(response.body)
          expect(json_response['data']).not_to be_empty
          expect(json_response['data'].first).to have_key('id')
        end
      end
    end
  end

  path '/clients/{client_id}/client_privacy_settings/{id}' do
    patch 'Update Client Privacy Setting' do
      operationId 'updateClientPrivacySetting'
      description 'Update a specific Client Privacy Setting'
      tags 'ClientPrivacySettings'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :client_id, in: :path, type: :string, required: true
      parameter name: :id, in: :path, type: :string, required: true
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ClientPrivacySettingUpdateRequest' },
                required: true

      response '200', 'Client Privacy Setting updated successfully' do
        let(:client_id) { client.id }
        let(:id) { client_privacy_setting.id }
        let(:body) do
          {
            data: {
              type: 'client_privacy_settings',
              id:,
              attributes: {
                disable_data_processing: true
              }

            }
          }
        end

        run_test! do |response|
          expect(response).to have_http_status(:ok)
          updated_setting = JSON.parse(response.body)['data']['attributes']
          expect(updated_setting['disable_data_processing']).to eq(true)
        end
      end
    end
  end
end
