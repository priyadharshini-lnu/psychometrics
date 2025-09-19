# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::Services::OpenaiResponseApi, type: :service do
  let(:model) { double('Model', id: 'gpt-4o', provider: 'openai') }
  let(:message) { double('Message', role: :user, content: 'Test message', tool_calls: nil, tool_call_id: nil) }
  let(:llm_chat) { double('LLM Chat', model: model, messages: [message], tools: {}, params: {}) }
  let(:service) { described_class.new(llm_chat) }

  # Mock Settings.ai_providers
  before do
    allow(Settings).to receive(:ai_providers).and_return([
      {
        'model_id' => 'gpt-4o',
        'context' => {
          'openai_api_key' => 'test-api-key',
          'openai_api_base' => 'https://test.cognitiveservices.azure.com/openai/deployments/gpt-4o?api-version=2024-08-01-preview'
        }
      }
    ])
  end

  describe '#call' do
    let(:mock_connection) { double('Faraday Connection') }
    let(:mock_response) { double('Response', success?: true, body: response_body, status: 200) }
    let(:response_body) do
      {
        'output' => [
          {
            'content' => [
              { 'type' => 'output_text', 'text' => 'AI Response' }
            ]
          }
        ],
        'usage' => {
          'input_tokens' => 10,
          'output_tokens' => 20
        },
        'model' => 'gpt-4o'
      }
    end

    before do
      allow(Faraday).to receive(:new).and_return(mock_connection)
      allow(mock_connection).to receive(:post).and_yield(double('Request').as_null_object).and_return(mock_response)
      allow(llm_chat).to receive(:add_message).and_return(double('Message', tool_call?: false))
      allow(llm_chat).to receive(:instance_variable_get).with(:@temperature).and_return(nil)
    end

    context 'when provider is valid' do
      it 'makes successful API request and returns message' do
        result = service.call

        expect(result).to be_truthy
        expect(llm_chat).to have_received(:add_message).with(
          hash_including(
            role: :assistant,
            content: 'AI Response',
            model_id: 'gpt-4o',
            input_tokens: 10,
            output_tokens: 20
          )
        )
      end

      context 'with actual PDF content object' do
        it 'formats PDF attachments in content correctly' do
          pdf_attachment = double('Attachment',
                                  type: :pdf,
                                  url?: true,
                                  source: URI('https://example.com/doc.pdf'))

          rich_content = double('Content',
                                text: 'Document text',
                                attachments: [pdf_attachment])

          content_message = double('Message',
                                   role: :user,
                                   content: rich_content,
                                   tool_calls: nil,
                                   tool_call_id: nil)

          allow(llm_chat).to receive(:messages).and_return([content_message])

          allow(service).to receive(:format_content).with(rich_content).and_return([
            { 'type' => 'input_text', 'text' => 'Document text' },
            { 'type' => 'input_file', 'file_url' => 'https://example.com/doc.pdf' }
          ])

          request_body = nil
          allow(mock_connection).to receive(:post) do |&block|
            request = double('Request')
            allow(request).to receive(:url)
            allow(request).to receive(:headers=)
            allow(request).to receive(:body=) { |body| request_body = body }
            block.call(request)
            mock_response
          end

          service.call

          parsed_body = JSON.parse(request_body)
          expect(parsed_body['input']).to be_an(Array)

          message_content = parsed_body['input'].first['content']
          expect(message_content).to be_an(Array)
          expect(message_content.length).to eq(2)

          text_part = message_content.find { |item| item['type'] == 'input_text' }
          expect(text_part).not_to be_nil
          expect(text_part['text']).to eq('Document text')

          pdf_part = message_content.find { |item| item['type'] == 'input_file' }
          expect(pdf_part).not_to be_nil
          expect(pdf_part['file_url']).to eq('https://example.com/doc.pdf')
        end
      end
    end

    context 'when provider is invalid' do
      let(:invalid_model) { double('Model', id: 'gpt-4o', provider: 'anthropic') }
      let(:invalid_llm_chat) { double('LLM Chat', model: invalid_model) }
      let(:invalid_service) { described_class.new(invalid_llm_chat) }

      it 'raises error for non-OpenAI provider' do
        expect { invalid_service.call }.to raise_error(
          AI::Services::OpenaiResponseApi::Error,
          /Only OpenAI provider is supported/
        )
      end
    end

    context 'when API configuration is missing' do
      before do
        allow(Settings).to receive(:ai_providers).and_return([
          {
            'model_id' => 'gpt-4o',
            'context' => {
              'openai_api_key' => nil,
              'openai_api_base' => nil
            }
          }
        ])
      end

      it 'raises error for missing API base URL' do
        expect { service.call }.to raise_error(
          AI::Services::OpenaiResponseApi::Error,
          /OpenAI API base URL is not configured/
        )
      end
    end

    context 'when API returns error response' do
      let(:error_response) do
        double('Response',
               success?: false,
               status: 401,
               body: { 'error' => { 'message' => 'Invalid API key' } })
      end

      before do
        allow(mock_connection).to receive(:post).and_return(error_response)
      end

      it 'raises error with API error message' do
        expect { service.call }.to raise_error(
          AI::Services::OpenaiResponseApi::Error,
          /Unauthorized \(401\): Check your API key\. Invalid API key/
        )
      end
    end
  end
end
