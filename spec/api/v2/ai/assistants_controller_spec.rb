# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

describe Api::V2::Administration::AI::AssistantsController, swagger_doc: 'v2/swagger.json', type: :request do
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, client: client) }
  let!(:project_id) { project.id }
  let!(:superadmin) { create(:superadmin) }
  let(:Authorization) { "Basic #{Base64.strict_encode64('key:token')}" }
  let!(:assistant) { create(:assistant, owner: client, model_id: 'azure-openai') }
  let!(:assistant_id) { assistant.id }
  let(:mock_provider_config) do
    config_double = double('ProviderConfig')
    allow(config_double).to receive(:id).and_return('azure-openai')
    allow(config_double).to receive(:provider).and_return('AzureOpenai')
    allow(config_double).to receive(:api_key).and_return('test-api-key')
    allow(config_double).to receive(:endpoint).and_return('https://test-endpoint.com/openai/deployments/gpt-4o/chat/completions')
    allow(config_double).to receive(:api_version).and_return('2023-05-15')
    config_double
  end

  before do
    sign_in(superadmin)
    # Mock Settings.ai_providers to avoid environment variable dependency
    allow(Settings).to receive(:ai_providers).and_return([mock_provider_config])
  end

  path '/ai/assistants' do
    get 'Fetch Assistants' do
      operationId 'FetchAssistants'
      description 'Fetch AI Assistants'
      tags 'AI Assistants'
      consumes 'application/vnd.api+json'
      security [basic: []]
      parameter name: :'filter[filterable_fields]', in: :query, required: false

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
              assistant_type: 'content_writer',
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

      response '200', 'Fetched Assistants filtered by name' do
        let!(:searched_assistant) do
          create(:assistant, owner: client, name: 'Alpha Assistant', model_id: 'azure-openai')
        end
        let!(:searched_assistant2) do
          create(:assistant, owner: client, name: 'Alpha Assistant 2', model_id: 'azure-openai')
        end
        let(:'filter[filterable_fields]') { 'Alpha' }

        run_test! do |response, _req|
          data = JSON.parse(response.body)['data']
          expect(data.length).to eq(2)
          expect(data.first['attributes']['name']).to include('Alpha')
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
                  assistant_type: { type: :string, example: 'content_writer' },
                  model_id: { type: :string, example: 'azure-openai' }
                },
                required: %w[name description system_prompt user_prompt type model_id]
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
                assistant_type: 'content_writer',
                model_id: 'azure-openai'
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
          expect(data).to have_key('assistant_type')
          expect(data).to have_key('created_at')
          expect(data).to have_key('updated_at')
          expect(data['name']).to eq('Test Assistant')
          expect(data['model_id']).to eq('azure-openai')
        end
      end

      response '201', 'Assistant created with output schema keys' do
        let(:assistant_params) do
          {
            data: {
              type: 'assistants',
              attributes: {
                name: 'Test Assistant with Schema',
                description: 'A test assistant with output schema keys',
                system_prompt: 'You are a helpful assistant',
                user_prompt: 'How can I help you?',
                assistant_type: 'content_writer',
                model_id: 'azure-openai',
                assistant_output_schema_keys_attributes: [
                  {
                    key: 'summary',
                    description: 'The summary of the content',
                    key_type: 'string'
                  }
                ]
              }
            }
          }
        end

        run_test! do |response|
          expect(response.status).to eq(201)
          data = JSON.parse(response.body)['data']

          expect(data['attributes']['name']).to eq('Test Assistant with Schema')
          expect(data['attributes']['model_id']).to eq('azure-openai')

          assistant = AI::Assistant.find(data['id'])
          expect(assistant.assistant_output_schema_keys.count).to eq(1)

          schema_keys = assistant.assistant_output_schema_keys
          summary_key = schema_keys.find { |k| k.key == 'summary' }

          expect(summary_key).to be_present
          expect(summary_key.description).to eq('The summary of the content')
          expect(summary_key.key_type).to eq('string')
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
                  type: { type: :string }
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
      response '200', 'Assistant updated with existing schema key modified' do
        let!(:assistant_with_schema) do
          create(:assistant, owner: client, model_id: 'azure-openai').tap do |asst|
            asst.assistant_output_schema_keys.create!(
              key: 'original_summary',
              description: 'Original description',
              key_type: 'string'
            )
          end
        end
        let(:id) { assistant_with_schema.id }
        let(:schema_key_id) { assistant_with_schema.assistant_output_schema_keys.first.id }

        let(:update_params) do
          {
            data: {
              id: id,
              type: 'assistants',
              attributes: {
                name: 'Updated Assistant with Schema',
                assistant_output_schema_keys_attributes: [
                  {
                    id: schema_key_id,
                    key: 'updated_summary',
                    description: 'Updated description for summary',
                    key_type: 'string'
                  }
                ]
              }
            }
          }
        end

        run_test! do |response|
          expect(response.status).to eq(200)
          data = JSON.parse(response.body)

          expect(data['data']['attributes']['name']).to eq('Updated Assistant with Schema')

          assistant = AI::Assistant.find(id)
          expect(assistant.assistant_output_schema_keys.count).to eq(1) # Still only 1 record

          updated_key = assistant.assistant_output_schema_keys.first
          expect(updated_key.id).to eq(schema_key_id)
          expect(updated_key.key).to eq('updated_summary')
          expect(updated_key.description).to eq('Updated description for summary')
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

    path '/ai/assistants/{id}/generate' do
      post 'Generate AI Response' do
        operationId 'GenerateAIResponse'
        description 'Generate a response using the AI assistant'
        tags 'AI Assistants'
        consumes 'application/vnd.api+json'
        produces 'application/json'
        security [basic: []]
        parameter name: :id, in: :path, type: :string, required: true

        response '200', 'Generated response' do
          let(:id) { assistant_id }

          before do
            # Mock the Service instead of the AI client directly
            allow(AI::AssistantService).
              to receive(:call).
              with(assistant_id.to_s, superadmin, nil, params: {}).
              and_return({ ok: { message: 'This is a test AI response' } })
          end

          run_test! do |response|
            expect(response.status).to eq(200)
            data = JSON.parse(response.body)

            expect(data).to have_key('attributes')
            expect(data.dig('attributes', 'message')).to eq('This is a test AI response')
          end
        end

        response '404', 'Assistant not found' do
          let(:id) { 'non-existent-id' }

          before do
            allow(AI::AssistantService).
              to receive(:call).
              with('non-existent-id', superadmin, nil, params: {}).
              and_raise(ActiveRecord::RecordNotFound.new)
          end

          run_test! do |response|
            expect(response.status).to eq(404)
            data = JSON.parse(response.body)

            expect(data).to have_key('error')
            expect(data['error']).to eq('Assistant not found')
          end
        end

        response '422', 'Error generating response' do
          let(:id) { assistant_id }

          before do
            # Simulate an error in the service
            allow(AI::AssistantService).
              to receive(:call).
              with(assistant_id.to_s, superadmin, nil, params: {}).
              and_raise(StandardError.new('AI provider error'))
          end

          run_test! do |response|
            expect(response.status).to eq(422)
            data = JSON.parse(response.body)

            expect(data).to have_key('error')
            expect(data['error']).to eq('AI provider error')
          end
        end
      end
    end

    path '/ai/assistants/{id}/revisions' do
      get 'Revisions of AI Response' do
        operationId 'AIAssistantRevisions'
        description 'Get AI revisions of the AI assistant'
        tags 'AI Assistants'
        consumes 'application/vnd.api+json'
        produces 'application/json'
        security [basic: []]
        parameter name: :id, in: :path, type: :string, required: true

        response '200', 'Revisions response' do
          let(:id) { assistant_id }

          before do
            # Create some audits for the assistant
            assistant = AI::Assistant.find(id)
            2.times do |i|
              assistant.update(name: "Revision #{i + 1}")
            end
          end

          run_test! do |response|
            expect(response.status).to eq(200)
            data = JSON.parse(response.body)
            expect(data).to have_key('data')
            expect(data['data']).to be_an(Array)
            expect(data['data'].size).to be >= 2

            revision = data['data'].first
            expect(revision).to have_key('id')
            expect(revision).to have_key('type')
            expect(revision['type']).to eq('assistant_revisions')
            expect(revision).to have_key('attributes')
            expect(revision['attributes']).to have_key('action')
            expect(revision['attributes']['action']).to eq('create')
            expect(revision['attributes']).to have_key('changes')
            expect(revision['attributes']['changes']).to have_key('name')
          end
        end
      end
    end

    path '/ai/assistants/render_prompt_template' do
      post 'Render Prompt Template' do
        operationId 'RenderPromptTemplate'
        description 'Render a prompt template using liquid templating with campaign and user context'
        tags 'AI Assistants'
        consumes 'application/vnd.api+json'
        produces 'application/json'
        security [basic: []]

        parameter name: :template_params, in: :body, schema: {
          type: :object,
          properties: {
            data: {
              type: :object,
              properties: {
                attributes: {
                  type: :object,
                  properties: {
                    template: { type: :string, example: 'Hello {{user.first_name}}! Campaign: {{campaign.name}}' },
                    campaign_id: { type: :string, example: '123' }
                  },
                  required: %w[template campaign_id]
                }
              }
            }
          }
        }, required: true

        response '200', 'Template rendered successfully' do
          let!(:campaign) { create(:campaign, name: 'Test Campaign') }
          let(:template_params) do
            {
              data: {
                attributes: {
                  template: 'Hello {{user.first_name}} {{user.last_name}}! Campaign: {{campaign.name}}',
                  campaign_id: campaign.id.to_s
                }
              }
            }
          end

          before do
            stub_wisper_publisher('AI::PromptTemplate::Renderer', :call, :ok, 'Hello John Doe! Campaign: Test Campaign')
          end

          run_test! do |response|
            expect(response.status).to eq(200)
            data = JSON.parse(response.body)
            expect(data).to have_key('attributes')
            expect(data['attributes']).to have_key('rendered_prompt')
          end
        end

        response '422', 'Template rendering failed' do
          let!(:campaign) { create(:campaign, name: 'Test Campaign') }
          let(:template_params) do
            {
              data: {
                attributes: {
                  template: 'Hello {{user.invalid_field}}! Campaign: {{campaign.name}}',
                  campaign_id: campaign.id.to_s
                }
              }
            }
          end

          before do
            stub_wisper_publisher('AI::PromptTemplate::Renderer', :call, :error,
                                  'Template rendering error: syntax error')
          end

          run_test! do |response|
            expect(response.status).to eq(422)
            data = JSON.parse(response.body)
            expect(data).to have_key('errors')
            expect(data['errors'][0]['detail']).to eq('Template rendering error: syntax error')
          end
        end
      end
    end
  end
end
