# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::AI::AssistantsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, client: client) }
  let!(:project_id) { project.id }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }
  let!(:assistant) { create(:ai_assistant, owner: client) }
  let!(:assistant_id) { assistant.id }

  before { sign_in(superadmin) }

  path '/ai/assistants' do
    get 'Fetch Assistants' do
      operationId 'FetchAssistants'
      description 'Fetch AI Assistants'
      tags 'AI Assistants'
      consumes 'application/vnd.api+json'
      security [basic: []]

      response '200', 'Fetched Assistants' do
        schema '$ref' => '#/components/schemas/AssistantsMultipleResponse'
        examples 'application/json' => {
          data: [{
            id: '1',
            type: 'assistants',
            attributes: {
              name: 'Sample Assistant',
              description: 'A sample AI assistant',
              system_prompt: 'You are a helpful assistant',
              user_prompt: 'How can I help you?',
              action: 'assist',
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z'
            },
            relationships: {
              owner: { data: { type: 'clients', id: 1 } },
              last_modified_by: { data: { type: 'users', id: 1 } }
            }
          }]
        }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data).to have_key('data')
          expect(data['data']).to be_an(Array)
          expect(data['data'].length).to be >= 1

          assistant_response = data['data'].first
          expect(assistant_response).to have_key('attributes')
          expect(assistant_response['attributes']).to have_key('name')
          expect(assistant_response['attributes']).to have_key('created_at')
          expect(assistant_response['attributes']).to have_key('updated_at')
          expect(assistant_response['type']).to eq('assistants')
        end
      end
    end

    post 'Create Assistant' do
      operationId 'CreateAssistant'
      description 'Create a new AI Assistant'
      tags 'AI Assistants'
      consumes 'application/vnd.api+json'
      security [basic: []]

      parameter name: :assistant_params, in: :body, schema: {
        type: :object,
        properties: {
          data: {
            type: :object,
            properties: {
              type: { type: :string, example: 'assistants' },
              attributes: {
                type: :object,
                properties: {
                  name: { type: :string, example: 'New Assistant' },
                  description: { type: :string, example: 'A new AI assistant' },
                  system_prompt: { type: :string, example: 'You are a helpful assistant' },
                  user_prompt: { type: :string, example: 'How can I help you?' },
                  action: { type: :string, example: 'assist' }
                },
                required: %w[name description system_prompt user_prompt action]
              }
            }
          }
        }
      }

      response '201', 'Assistant created' do
        let(:assistant_params) do
          {
            data: {
              type: 'assistants',
              attributes: {
                name: 'Test Assistant',
                description: 'A test assistant',
                system_prompt: 'You are a helpful assistant',
                user_prompt: 'How can I help you?',
                action: 'assist'
              }
            }
          }
        end

        run_test! do |response|
          expect(response.status).to eq(201)
          data = JSON.parse(response.body)['data']['attributes']

          # The create response is a flat hash of attributes
          expect(data).to have_key('name')
          expect(data).to have_key('description')
          expect(data).to have_key('action')
          expect(data).to have_key('created_at')
          expect(data).to have_key('updated_at')
          expect(data['name']).to eq('Test Assistant')
        end
      end
    end
  end

  path '/ai/assistants/{id}' do
    get 'Get Assistant' do
      operationId 'GetAssistant'
      description 'Get a specific AI Assistant'
      tags 'AI Assistants'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :id, in: :path, type: :string, required: true

      response '200', 'Assistant found' do
        let(:id) { assistant_id }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data).to have_key('data')

          assistant_response = data['data']
          expect(assistant_response).to have_key('attributes')
          expect(assistant_response['attributes']).to have_key('name')
          expect(assistant_response['id']).to eq(assistant_id.to_s)
        end
      end
    end

    put 'Update Assistant' do
      operationId 'UpdateAssistant'
      description 'Update an AI Assistant'
      tags 'AI Assistants'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :id, in: :path, type: :string, required: true
      parameter name: :update_params, in: :body, schema: {
        type: :object,
        properties: {
          data: {
            type: :object,
            properties: {
              id: { type: :string },
              type: { type: :string, example: 'assistants' },
              attributes: {
                type: :object,
                properties: {
                  name: { type: :string, example: 'Updated Assistant' },
                  description: { type: :string, example: 'An updated AI assistant' },
                  system_prompt: { type: :string },
                  user_prompt: { type: :string },
                  action: { type: :string }
                }
              }
            }
          }
        }
      }

      response '200', 'Assistant updated' do
        let(:id) { assistant_id }
        let(:update_params) do
          {
            data: {
              id: id,
              type: 'assistants',
              attributes: {
                name: 'Updated Assistant'
              }
            }
          }
        end

        run_test! do |response|
          expect(response.status).to eq(200)
          data = JSON.parse(response.body)
          expect(data).to have_key('data')

          assistant_response = data['data']
          expect(assistant_response).to have_key('attributes')
          expect(assistant_response['attributes']).to have_key('name')
          expect(assistant_response['attributes']['name']).to eq('Updated Assistant')
        end
      end
    end

    delete 'Delete Assistant' do
      operationId 'DeleteAssistant'
      description 'Delete an AI Assistant'
      tags 'AI Assistants'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :id, in: :path, type: :string, required: true

      response '204', 'Assistant deleted' do
        let(:id) { assistant_id }

        run_test!
      end
    end
  end
end
