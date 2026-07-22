# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::AssistantService do
  let!(:user) { create(:user) }
  let!(:assistant) do
    create(:assistant, model_id: 'gpt-4', system_prompt: 'You are a helpful assistant.',
user_prompt: 'How can I help you?')
  end

  let(:ai_provider_config) do
    {
      'model_id' => 'gpt-4',
      'name' => 'Azure OpenAI',
      'context' => {
        'openai_api_key' => 'test-api-key',
        'openai_api_base' => 'https://test-endpoint.azure.com'
      }
    }
  end

  let(:llm_response) do
    instance_double(RubyLLM::Message, content: 'LLM says hello', input_tokens: 12, output_tokens: 8,
                                     thinking_tokens: nil)
  end

  before do
    allow(Settings).to receive(:ai_providers).and_return([ai_provider_config])
    RubyLLM.configure { |c| c.openai_api_key = 'test-global-key' }
    allow_any_instance_of(AI::AssistantChat).to receive(:ask).and_return(llm_response)
  end

  describe '.call!' do
    it 'returns the expected response hash' do
      result = described_class.call!(assistant.id, user, nil)
      expect(result[:message]).to eq(llm_response.content)
      expect(result[:input_tokens]).to eq(llm_response.input_tokens)
      expect(result[:output_tokens]).to eq(llm_response.output_tokens)
      expect(result[:thinking_tokens]).to eq(llm_response.thinking_tokens)
    end

    it 'creates a new chat for the user and assistant' do
      expect { described_class.call!(assistant.id, user, nil) }.to change(AI::AssistantChat, :count).by(1)
      chat = AI::AssistantChat.last
      expect(chat.ai_assistant).to eq(assistant)
      expect(chat.user).to eq(user)
    end

    context 'with prompt data' do
      prompt = 'Show me the table'
      expected_prompt = <<~USER_PROMPT
        How can I help you?
        #{prompt}
      USER_PROMPT
      it 'sends correct concatenated prompt to the llm' do
        expect_any_instance_of(AI::AssistantChat).to receive(:ask).
          with(expected_prompt.strip)
        described_class.call!(assistant.id, user, prompt)
      end
    end

    context 'when RubyLLM raises an error' do
      before do
        allow_any_instance_of(AI::AssistantChat).to receive(:ask).and_raise(RubyLLM::Error.new)
      end

      it 'broadcasts an error with the AI error message' do
        result = described_class.call(assistant.id, user, nil)
        expect(result[:error]).to include('RubyLLM::Error')
      end
    end

    context 'when assistant does not exist' do
      it 'raises RecordNotFound' do
        expect { described_class.call!('bogus-id', user, nil) }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'persists chat and messages' do
      let(:prompt) { 'Hi!' }
      it 'persists chat and messages for each call' do
        expect { described_class.call!(assistant.id, user, prompt) }.to change(AI::AssistantChat, :count).by(1)
      end
    end

    context 'with ask_params' do
      let(:ask_params) { { service: :openai_response_api, persist_attachment: true } }
      let(:prompt) { 'Test message' }

      it 'passes ask_params to chat.ask method' do
        expect_any_instance_of(AI::AssistantChat).to receive(:ask).
          with(anything, **ask_params)

        described_class.call!(assistant.id, user, prompt, ask_params: ask_params)
      end
    end
  end

  context 'with validation responses with multiple attempts' do
    let(:assistant_with_validation) do
      create(:assistant, model_id: 'gpt-4', system_prompt: 'You are a helpful assistant.',
             user_prompt: 'How can I help you?')
    end
    let(:chat) do
      AI::AssistantChat.new(ai_assistant: assistant_with_validation, user: user)
    end
    let(:output_schema_class) { double('OutputSchemaClass') }
    let(:invalid_llm_response) do
      instance_double(RubyLLM::Message, content: '{"error": "invalid"}', input_tokens: 12, output_tokens: 8,
                                        thinking_tokens: nil)
    end
    let(:valid_llm_response) do
      instance_double(RubyLLM::Message, content: '{"translated_texts": ["Hello"]}', input_tokens: 15,
                                        output_tokens: 10, thinking_tokens: nil)
    end

    before do
      allow(assistant_with_validation).to receive(:output_schema_class).and_return(output_schema_class)
      allow(AI::Assistant).to receive(:find).with(assistant_with_validation.id).and_return(assistant_with_validation)
      allow_any_instance_of(described_class).to receive(:chat).and_return(chat)
    end

    context 'when validation fails for max retry attempts' do
      it 'returns error after 3 failed attempts' do
        allow(output_schema_class).to receive(:validate_response).
          and_raise(AI::OutputSchemas::Base::InvalidResponseStructureError.new('Validation error'))
        allow(chat).to receive(:ask).and_return(invalid_llm_response)
        allow(chat).to receive(:ask_for_correction).and_return(invalid_llm_response)

        result = described_class.call(assistant_with_validation.id, user, nil, validate_response_structure: true,
                                      max_retry_count: 3)

        expect(result[:error]).to include(I18n.t('admin.assistant_validation_failed'))
        expect(output_schema_class).to have_received(:validate_response).at_least(3).times
      end
    end

    context 'when validation passes on second attempt' do
      it 'returns successful response on second attempt' do
        call_count = 0
        allow(output_schema_class).to receive(:validate_response) do
          call_count += 1
          raise AI::OutputSchemas::Base::InvalidResponseStructureError, 'Validation error' if call_count == 1
        end

        allow(chat).to receive(:ask).and_return(invalid_llm_response)
        allow(chat).to receive(:ask_for_correction).and_return(valid_llm_response)

        result = described_class.call!(assistant_with_validation.id, user, nil, validate_response_structure: true,
                                       max_retry_count: 3)

        expect(result[:message]).to eq(valid_llm_response.content)
        expect(result[:input_tokens]).to eq(valid_llm_response.input_tokens)
        expect(result[:output_tokens]).to eq(valid_llm_response.output_tokens)
      end
    end

    context 'when validation fails and a correction is sent' do
      it 'calls ask_for_correction with the validation error message' do
        validation_error = 'must be valid JSON'
        allow(output_schema_class).to receive(:validate_response).
          and_raise(AI::OutputSchemas::Base::InvalidResponseStructureError.new(validation_error))
        allow(chat).to receive(:ask).and_return(invalid_llm_response)
        allow(chat).to receive(:ask_for_correction).and_return(valid_llm_response)

        described_class.call(assistant_with_validation.id, user, nil, validate_response_structure: true,
                             max_retry_count: 1)

        expect(chat).to have_received(:ask_for_correction).
          with("Error: System cannot render the message to user: #{validation_error}")
      end
    end
  end

  describe '#retry_last_request' do
    let(:chat) do
      AI::AssistantChat.create!(ai_assistant: assistant, user: user)
    end
    let(:existing_message) do
      AI::AssistantRequest.create!(
        ai_assistant_chat: chat,
        role: 'user',
        content: 'Previous message'
      )
    end

    before do
      existing_message # Create the existing message
    end

    context 'when complete succeeds' do
      it 'does not create a new message record' do
        allow_any_instance_of(AI::AssistantChat).to receive(:complete).and_return(llm_response)

        expect do
          described_class.new(assistant.id, user, nil, chat: chat).retry_last_request
        end.not_to change(AI::AssistantRequest, :count)
      end

      it 'broadcasts success with response data' do
        allow_any_instance_of(AI::AssistantChat).to receive(:complete).and_return(llm_response)

        service = described_class.new(assistant.id, user, nil, chat: chat)
        result = nil

        service.on(:ok) { |response| result = response }
        service.retry_last_request

        expect(result[:message]).to eq(llm_response.content)
        expect(result[:input_tokens]).to eq(llm_response.input_tokens)
        expect(result[:output_tokens]).to eq(llm_response.output_tokens)
      end
    end

    context 'when RubyLLM raises an error' do
      let(:error_message) { 'Rate limit exceeded' }

      before do
        allow_any_instance_of(AI::AssistantChat).to receive(:complete).and_raise(
          RubyLLM::BadRequestError.new(nil, error_message)
        )
      end

      it 'does not create a new message record' do
        expect do
          described_class.new(assistant.id, user, nil, chat: chat).retry_last_request
        end.not_to change(AI::AssistantRequest, :count)
      end

      it 'marks the last request as failed with error' do
        service = described_class.new(assistant.id, user, nil, chat: chat)
        service.retry_last_request

        existing_message.reload
        expect(existing_message.request_status_failed?).to be true
        expect(existing_message.last_error_message).to eq(error_message)
      end

      it 'broadcasts error with error message' do
        service = described_class.new(assistant.id, user, nil, chat: chat)
        error_result = nil
        error_obj = nil

        service.on(:error) do |msg, err|
          error_result = msg
          error_obj = err
        end
        service.retry_last_request

        expect(error_result).to eq(error_message)
        expect(error_obj).to be_a(RubyLLM::BadRequestError)
      end
    end
  end
end
