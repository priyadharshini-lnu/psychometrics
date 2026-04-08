# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::AssistantChat, type: :model do
  subject(:assistant_chat) { build(:assistant_chat) }

  let(:ai_provider_config) do
    {
      'model_id' => 'gpt-4o-mini',
      'name' => 'OpenAI GPT-4o Mini',
      'context' => {
        'openai_api_key' => 'test-api-key'
      }
    }
  end

  before do
    allow(Settings).to receive(:ai_providers).and_return([ai_provider_config])
  end

  describe '#ask' do
    let(:user) { create(:user) }
    let(:assistant) { create(:assistant) }
    let(:chat) { create(:assistant_chat, ai_assistant: assistant, user: user) }
    let(:message) { 'Test message' }
    let(:attachment_url) { 'http://example.com/document.pdf' }

    context 'when service is :openai_response_api' do
      let(:llm_chat) { double('LLM Chat') }
      let(:mock_content) { RubyLLM::Content.new(message) }
      let(:response_message) do
        double('Response Message',
               content: 'AI Response',
               role: :assistant,
               model_id: 'gpt-4o',
               input_tokens: 10,
               output_tokens: 20,
               tool_calls: nil,
               to_h: {
                 role: :assistant,
                 content: 'AI Response',
                 model_id: 'gpt-4o',
                 input_tokens: 10,
                 output_tokens: 20
               })
      end

      before do
        allow(chat).to receive(:to_llm).and_return(llm_chat)
        allow(llm_chat).to receive(:add_message)

        allow(AI::Services::OpenaiResponseApi).to receive(:call!).and_return(response_message)

        allow(RubyLLM::Attachment).to receive(:new).and_return(
          double('Attachment',
                 content: 'mock content',
                 filename: 'test.pdf',
                 mime_type: 'application/pdf')
        )
      end

      it 'calls OpenaiResponseApi service' do
        expect(AI::Services::OpenaiResponseApi).to receive(:call!).with(llm_chat, assistant.model_id)

        chat.ask(message, with: attachment_url, service: :openai_response_api)
      end

      it 'creates LLM chat object and adds message without persisting to DB initially' do
        expect(chat).to receive(:to_llm).and_return(llm_chat)
        allow(RubyLLM::Content).to receive(:new).and_call_original
        expect(RubyLLM::Content).to receive(:new).with(message, attachment_url).and_return(mock_content)
        expect(llm_chat).to receive(:add_message).with(role: :user, content: mock_content)

        chat.ask(message, with: attachment_url, service: :openai_response_api)
      end

      context 'when persist_attachment is false (default)' do
        it 'creates user message without attachment in database' do
          expect do
            chat.ask(message, with: attachment_url, service: :openai_response_api)
          end.to change { chat.messages.where(role: 'user').count }.by(1)

          user_message = chat.messages.where(role: 'user').last
          expect(user_message.content).to eq(message)
        end
      end

      context 'when persist_attachment is true' do
        it 'creates user message with attachment in database' do
          expect do
            chat.ask(message, with: attachment_url, service: :openai_response_api, persist_attachment: true)
          end.to change { chat.messages.where(role: 'user').count }.by(1)

          user_message = chat.messages.where(role: 'user').last
          expect(user_message.content).to eq(message)
          expect(user_message.attachments.count).to eq(1)
        end
      end

      it 'persists the response message' do
        expect do
          chat.ask(message, with: attachment_url, service: :openai_response_api)
        end.to change { chat.messages.where(role: 'assistant').count }.by(1)

        assistant_message = chat.messages.where(role: 'assistant').last
        expect(assistant_message.content).to eq('AI Response')
        expect(assistant_message.input_tokens).to eq(10)
        expect(assistant_message.output_tokens).to eq(20)
      end

      it 'returns the response message' do
        result = chat.ask(message, with: attachment_url, service: :openai_response_api)

        expect(result).to eq(response_message)
      end

      context 'when an error occurs in the API call' do
        let(:error) { StandardError.new('API Error') }

        before do
          allow(AI::Services::OpenaiResponseApi).to receive(:call!).and_raise(error)
        end

        context 'when persist_attachment is false' do
          it 'still persists user message without attachment for audit trail and re-raises error' do
            expect do
              expect do
                chat.ask(message, with: attachment_url, service: :openai_response_api)
              end.to raise_error(error)
            end.to change { chat.messages.where(role: 'user').count }.by(1)

            user_message = chat.messages.where(role: 'user').last
            expect(user_message.content).to eq(message)
          end
        end

        context 'when persist_attachment is true' do
          it 'still persists user message with attachment for audit trail and re-raises error' do
            expect do
              expect do
                chat.ask(message, with: attachment_url, service: :openai_response_api, persist_attachment: true)
              end.to raise_error(error)
            end.to change { chat.messages.where(role: 'user').count }.by(1)

            user_message = chat.messages.where(role: 'user').last
            expect(user_message.content).to eq(message)
            expect(user_message.attachments.count).to eq(1)
          end
        end

        it 'does not persist response message when error occurs' do
          expect do
            expect do
              chat.ask(message, with: attachment_url, service: :openai_response_api)
            end.to raise_error(error)
          end.not_to(change { chat.messages.where(role: 'assistant').count })
        end
      end
    end

    context 'when service is nil (default behavior)' do
      before do
        allow(chat).to receive_message_chain(:to_llm, :complete).and_return('response')
        allow(chat).to receive(:add_message)
      end

      it 'does not call OpenaiResponseApi service' do
        expect(AI::Services::OpenaiResponseApi).not_to receive(:call!)

        chat.ask(message, with: attachment_url)
      end

      it 'calls the parent ask method' do
        expect(chat).to receive(:add_message).with(role: :user, content: instance_of(RubyLLM::Content))

        chat.ask(message, with: attachment_url)
      end
    end
  end

  describe '#with_assistant_context' do
    let(:user) { create(:user) }
    let(:assistant) { create(:assistant) }
    let(:chat) { create(:assistant_chat, ai_assistant: assistant, user: user) }
    let(:llm_chat) { double('LLM Chat') }
    let(:ruby_llm_context) { double('Ruby LLM Context') }
    let(:assistant_default_params) { assistant.send(:default_params) }

    before do
      allow(chat).to receive(:to_llm).and_return(llm_chat)
      allow(llm_chat).to receive(:with_context).and_return(llm_chat)
      allow(llm_chat).to receive(:with_schema).and_return(llm_chat)
      allow(llm_chat).to receive(:with_tools).and_return(llm_chat)
      allow(llm_chat).to receive(:with_params).and_return(llm_chat)
      allow(assistant).to receive(:ruby_llm_context).and_return(ruby_llm_context)
      allow(assistant).to receive(:has_ruby_llm_schema?).and_return(false)
    end

    it 'adds assistant context to LLM chat' do
      expect(llm_chat).to receive(:with_context).with(ruby_llm_context)

      chat.with_assistant_context
    end

    it 'does not add or overrides existing instructions to LLM chat' do
      expect(llm_chat).not_to receive(:with_instructions)

      chat.with_assistant_context
    end

    context 'when assistant has ruby llm schema' do
      let(:output_schema_class) { AI::OutputSchemas::IdpAssistant }

      before do
        allow(assistant).to receive(:has_ruby_llm_schema?).and_return(true)
        allow(assistant).to receive(:output_schema_class).and_return(output_schema_class)
      end

      it 'adds schema to LLM chat' do
        expect(llm_chat).to receive(:with_schema).with(output_schema_class)

        chat.with_assistant_context
      end
    end

    context 'when assistant does not have ruby llm schema' do
      before do
        allow(assistant).to receive(:has_ruby_llm_schema?).and_return(false)
      end

      it 'does not add schema to LLM chat' do
        expect(llm_chat).not_to receive(:with_schema)

        chat.with_assistant_context
      end
    end

    context 'when tools option is provided' do
      let(:tools) { %i[tool1 tool2] }

      it 'adds tools to LLM chat with replace: true' do
        expect(llm_chat).to receive(:with_tools).with(:tool1, :tool2, replace: true)

        chat.with_assistant_context(tools: tools)
      end
    end

    context 'when tools option is not provided' do
      it 'does not add tools to LLM chat' do
        expect(llm_chat).not_to receive(:with_tools)

        chat.with_assistant_context
      end
    end

    context 'when params option is provided' do
      let(:params) { { temperature: 0.7, max_tokens: 100 } }

      it 'adds params to LLM chat' do
        expected_params = assistant_default_params.merge(params)
        expect(llm_chat).to receive(:with_params).with(expected_params)

        chat.with_assistant_context(params: params)
      end
    end

    context 'when params option is not provided' do
      it 'adds default params to LLM chat' do
        expect(llm_chat).to receive(:with_params).with(assistant_default_params)

        chat.with_assistant_context
      end
    end

    it 'returns self for method chaining' do
      result = chat.with_assistant_context

      expect(result).to eq(chat)
    end

    it 'works with multiple options' do
      tools = %i[tool1 tool2]
      params = { temperature: 0.7 }

      expect(llm_chat).to receive(:with_context).with(ruby_llm_context)
      expect(llm_chat).to receive(:with_tools).with(:tool1, :tool2, replace: true)
      expected_params = assistant_default_params.merge(params)
      expect(llm_chat).to receive(:with_params).with(expected_params)

      result = chat.with_assistant_context(tools: tools, params: params)
      expect(result).to eq(chat)
    end
  end

  describe '#ask_for_correction' do
    let(:user) { create(:user) }
    let(:assistant) { create(:assistant) }
    let(:chat) { create(:assistant_chat, ai_assistant: assistant, user: user) }
    let(:correction_message) { 'Error: System cannot render the message to user: must be valid JSON' }
    let(:complete_response) do
      instance_double(RubyLLM::Message, content: '{"key": "value"}', input_tokens: 10, output_tokens: 5)
    end

    before do
      allow(chat).to receive(:complete).and_return(complete_response)
    end

    it 'creates a user message with the correction content' do
      expect { chat.ask_for_correction(correction_message) }.
        to change { chat.messages.where(role: 'user').count }.by(1)

      user_message = chat.messages.where(role: 'user').last
      expect(user_message.content).to eq(correction_message)
    end

    it 'sets request_status to correction on the created message' do
      chat.ask_for_correction(correction_message)

      user_message = chat.messages.where(role: 'user').last
      expect(user_message.request_status_correction?).to be true
    end

    it 'calls complete and returns the response' do
      result = chat.ask_for_correction(correction_message)

      expect(result).to eq(complete_response)
    end
  end
end
