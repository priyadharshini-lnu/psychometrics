# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::AI::AssistantsController, type: :request do
  let!(:client) { create(:tenancy) }
  let!(:project) { create(:project, client: client) }
  let!(:project_id) { project.id }
  let!(:superadmin) { create(:superadmin) }
  let!(:assistant) { create(:assistant, owner: client, model_id: 'azure-openai') }
  let!(:assistant_id) { assistant.id }
  let(:headers) do
    {
      'Content-Type' => 'application/vnd.api+json'
    }
  end
  let(:mock_provider_config) do
    {
      'model_id' => 'azure-openai',
      'model' => 'gpt-4o',
      'name' => 'Azure OpenAI GPT-4o',
      'custom_provider' => nil,
      'context' => {
        'azure_api_key' => 'test-api-key',
        'azure_endpoint' => 'https://test-endpoint.com/openai/deployments/gpt-4o/chat/completions',
        'azure_api_version' => '2023-05-15'
      }
    }
  end

  before do
    sign_in(superadmin)
    # Mock Settings.ai_providers to avoid environment variable dependency
    allow(Settings).to receive(:ai_providers).and_return([mock_provider_config])
  end

  after do
    sign_out(superadmin)
  end

  describe 'GET #index' do
    context 'when fetching assistants' do
      it 'returns a successful response with assistants data' do
        get '/api/v2/administration/ai/assistants', headers: headers

        expect(response).to have_http_status(200)
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

    context 'when filtering assistants by name' do
      let!(:searched_assistant) do
        create(:assistant, owner: client, name: 'Alpha Assistant', model_id: 'azure-openai')
      end
      let!(:searched_assistant2) do
        create(:assistant, owner: client, name: 'Alpha Assistant 2', model_id: 'azure-openai')
      end

      it 'returns filtered assistants' do
        get '/api/v2/administration/ai/assistants', params: { 'filter[filterable_fields]' => 'Alpha' }, headers: headers

        expect(response).to have_http_status(200)
        data = JSON.parse(response.body)['data']
        expect(data.length).to eq(2)
        expect(data.first['attributes']['name']).to include('Alpha')
      end
    end
  end

  describe 'POST #create' do
    context 'when creating a new assistant' do
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

      it 'creates a new assistant successfully' do
        post '/api/v2/administration/ai/assistants', params: assistant_params.to_json, headers: headers

        expect(response).to have_http_status(201)
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

    context 'when creating assistant with output schema keys' do
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

      it 'creates assistant with schema keys successfully' do
        post '/api/v2/administration/ai/assistants', params: assistant_params.to_json, headers: headers

        expect(response).to have_http_status(201)
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

  describe 'GET #show' do
    context 'when fetching a specific assistant' do
      it 'returns the assistant successfully' do
        get "/api/v2/administration/ai/assistants/#{assistant_id}", headers: headers

        expect(response).to have_http_status(200)
        data = JSON.parse(response.body)
        expect(data).to have_key('data')

        assistant_response = data['data']
        expect(assistant_response).to have_key('attributes')
        expect(assistant_response['attributes']).to have_key('name')
        expect(assistant_response['id']).to eq(assistant_id.to_s)
      end
    end
  end

  describe 'PUT #update' do
    context 'when updating an assistant' do
      let(:update_params) do
        {
          id: assistant_id,
          data: {
            id: assistant_id,
            type: 'assistants',
            attributes: {
              name: 'Updated Assistant'
            }
          }
        }
      end

      it 'updates the assistant successfully' do
        put "/api/v2/administration/ai/assistants/#{assistant_id}", params: update_params.to_json, headers: headers

        expect(response).to have_http_status(200)
        data = JSON.parse(response.body)
        expect(data).to have_key('data')

        assistant_response = data['data']
        expect(assistant_response).to have_key('attributes')
        expect(assistant_response['attributes']).to have_key('name')
        expect(assistant_response['attributes']['name']).to eq('Updated Assistant')
      end
    end

    context 'when updating assistant with existing schema key modified' do
      let!(:assistant_with_schema) do
        create(:assistant, owner: client, model_id: 'azure-openai').tap do |asst|
          asst.assistant_output_schema_keys.create!(
            key: 'original_summary',
            description: 'Original description',
            key_type: 'string'
          )
        end
      end
      let(:schema_key_id) { assistant_with_schema.assistant_output_schema_keys.first.id }

      let(:update_params) do
        {
          id: assistant_with_schema.id,
          data: {
            id: assistant_with_schema.id,
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

      it 'updates the assistant with modified schema key' do
        put "/api/v2/administration/ai/assistants/#{assistant_with_schema.id}", params: update_params.to_json,
headers: headers

        expect(response).to have_http_status(200)
        data = JSON.parse(response.body)

        expect(data['data']['attributes']['name']).to eq('Updated Assistant with Schema')

        assistant = AI::Assistant.find(assistant_with_schema.id)
        expect(assistant.assistant_output_schema_keys.count).to eq(1) # Still only 1 record

        updated_key = assistant.assistant_output_schema_keys.first
        expect(updated_key.id).to eq(schema_key_id)
        expect(updated_key.key).to eq('updated_summary')
        expect(updated_key.description).to eq('Updated description for summary')
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'when deleting an assistant' do
      it 'deletes the assistant successfully' do
        delete "/api/v2/administration/ai/assistants/#{assistant_id}", headers: headers

        expect(response).to have_http_status(204)
      end
    end
  end

  describe 'POST #generate' do
    context 'when generating AI response' do
      before do
        # Mock the Service instead of the AI client directly
        allow(AI::AssistantService).
          to receive(:call).
          with(
            assistant_id.to_s,
            superadmin,
            nil,
            skip_default_params: true
          ).
          and_return({ ok: { message: 'This is a test AI response' } })
      end

      it 'generates response successfully' do
        post "/api/v2/administration/ai/assistants/#{assistant_id}/generate", headers: headers

        expect(response).to have_http_status(200)
        data = JSON.parse(response.body)

        expect(data).to have_key('attributes')
        expect(data.dig('attributes', 'message')).to eq('This is a test AI response')
      end
    end

    context 'when assistant is not found' do
      before do
        allow(AI::AssistantService).
          to receive(:call).
          with(
            'non-existent-id',
            superadmin,
            nil,
            skip_default_params: true
          ).
          and_raise(ActiveRecord::RecordNotFound.new)
      end

      it 'returns 404 error' do
        post '/api/v2/administration/ai/assistants/non-existent-id/generate', headers: headers

        expect(response).to have_http_status(404)
        data = JSON.parse(response.body)

        expect(data).to have_key('error')
        expect(data['error']).to eq('Assistant not found')
      end
    end

    context 'when error occurs during generation' do
      before do
        # Simulate an error in the service
        allow(AI::AssistantService).
          to receive(:call).
          with(
            assistant_id.to_s,
            superadmin,
            nil,
            skip_default_params: true
          ).
          and_raise(StandardError.new('AI provider error'))
      end

      it 'returns 422 error' do
        post "/api/v2/administration/ai/assistants/#{assistant_id}/generate", headers: headers

        expect(response).to have_http_status(422)
        data = JSON.parse(response.body)

        expect(data).to have_key('error')
        expect(data['error']).to eq('AI provider error')
      end
    end
  end

  describe 'GET #revisions' do
    context 'when fetching assistant revisions' do
      before do
        # Create some audits for the assistant
        assistant = AI::Assistant.find(assistant_id)
        2.times do |i|
          assistant.update(name: "Revision #{i + 1}")
        end
      end

      it 'returns revisions successfully' do
        get "/api/v2/administration/ai/assistants/#{assistant_id}/revisions", headers: headers

        expect(response).to have_http_status(200)
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

  describe 'POST #render_prompt_template' do
    context 'when rendering template successfully' do
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

      it 'renders template successfully' do
        post '/api/v2/administration/ai/assistants/render_prompt_template', params: template_params.to_json,
headers: headers

        expect(response).to have_http_status(200)
        data = JSON.parse(response.body)
        expect(data).to have_key('attributes')
        expect(data['attributes']).to have_key('rendered_prompt')
      end
    end

    context 'when template rendering fails' do
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

      it 'returns 422 error for template rendering failure' do
        post '/api/v2/administration/ai/assistants/render_prompt_template', params: template_params.to_json,
headers: headers

        expect(response).to have_http_status(422)
        data = JSON.parse(response.body)
        expect(data).to have_key('errors')
        expect(data['errors'][0]['detail']).to eq('Template rendering error: syntax error')
      end
    end
  end
end
