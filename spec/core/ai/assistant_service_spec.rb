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
    instance_double(RubyLLM::Message, content: 'LLM says hello', input_tokens: 12, output_tokens: 8)
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
end
