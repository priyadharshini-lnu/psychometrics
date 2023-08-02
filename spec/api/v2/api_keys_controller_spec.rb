# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::ApiKeysController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:superadmin) { create(:superadmin) }
  let!(:user) { create(:client_admin) }
  let!(:api_key) { create(:api_key, user: user) }
  let(:user_id) { user.id }
  let(:Authorization) { "Basic #{::Base64.strict_encode64('key:token')}" }

  before { sign_in(superadmin) }

  path '/users/{user_id}/api_keys/' do
    get 'API Keys List' do
      operationId 'ListApiKeys'
      description 'Fetch API keys list'
      tags 'API Keys'
      consumes 'application/json'
      security [basic: []]
      parameter name: :user_id, in: :path, type: :string

      response '200', 'API Keys List' do
        schema '$ref' => '#/components/schemas/ApiKeyListResponse'
        examples 'application/json' => {
          data: [
            {
              id: '2',
              type: 'api_keys',
              attributes: {
                key: 'f6f8b5fb-f7cb-4614-befb-362447a482fd',
                token: '097afa7f4b164fe8e5724ebeb096b623aa1dc79f8bdeb43ad0a3c6a7c2e9cc9e',
                disabled: false,
                created_at: '2023-07-25T12:55:44.407+04:00',
                updated_at: '2023-07-25T21:11:50.344+04:00',
                description: 'This is going to be used for gitlab v2'
              }
            }
          ]
        }

        run_test! do |response|
          response = JSON.parse(response.body)
          api_key_response = response['data'].find { |d| d['id'] == api_key.id.to_s }
          expect(api_key_response).to have_key('id')
          expect(api_key_response).to have_attribute(:key).with_value(api_key.key)
        end
      end
    end
  end

  path '/users/{user_id}/api_keys/' do
    post 'Create an API key' do
      operationId 'CreateApiKey'
      description 'Create a new API Key'
      tags 'API Keys'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :user_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ApiKeyCreateRequest' }

      response '201', 'API Key Created' do
        schema '$ref' => '#/components/schemas/ApiKeyResponse'
        examples 'application/json' => {
          data: {
            id: '2',
            type: 'api_keys',
            attributes: {
              key: 'f6f8b5fb-f7cb-4614-befb-362447a482fd',
              token: '097afa7f4b164fe8e5724ebeb096b623aa1dc79f8bdeb43ad0a3c6a7c2e9cc9e',
              disabled: false,
              created_at: '2023-07-25T12:55:44.407+04:00',
              updated_at: '2023-07-25T21:11:50.344+04:00',
              description: 'This is going to be used for gitlab v2'
            }
          }
        }

        let(:body) do
          {
            data: {
              type: 'api_keys',
              attributes: {
                description: 'New API Key description'
              }
            }
          }
        end

        run_test! do |response|
          api_key_response = JSON.parse(response.body)['data']
          expect(api_key_response).to have_key('id')
        end
      end
    end
  end

  path '/users/{user_id}/api_keys/{api_key_id}' do
    patch 'Update an API key' do
      operationId 'UpdateApiKey'
      description 'Update an API Key'
      tags 'API Keys'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :user_id, in: :path, type: :string
      parameter name: :api_key_id, in: :path, type: :string
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/ApiKeyUpdateRequest' }

      response '200', 'API Key Updated' do
        schema '$ref' => '#/components/schemas/ApiKeyResponse'
        examples 'application/json' => {
          data: {
            id: '2',
            type: 'api_keys',
            attributes: {
              key: 'f6f8b5fb-f7cb-4614-befb-362447a482fd',
              token: '097afa7f4b164fe8e5724ebeb096b623aa1dc79f8bdeb43ad0a3c6a7c2e9cc9e',
              disabled: false,
              created_at: '2023-07-25T12:55:44.407+04:00',
              updated_at: '2023-07-25T21:11:50.344+04:00',
              description: 'This is going to be used for gitlab v2'
            }
          }
        }

        let(:api_key_id) { api_key.id }
        let(:body) do
          {
            data: {
              type: 'api_keys',
              id: api_key.id.to_s,
              attributes: {
                description: 'Updated API Key description'
              }
            }
          }
        end

        run_test! do |response|
          api_key_response = JSON.parse(response.body)['data']
          expect(api_key_response).to have_key('id')
        end
      end
    end
  end
end
