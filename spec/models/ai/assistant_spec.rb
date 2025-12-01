# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::Assistant, type: :model do
  subject(:assistant) { build(:assistant) }

  let(:ai_provider_config) do
    {
      'model_id' => 'gpt-4o-mini',
      'model' => 'gpt-4o-mini',
      'name' => 'OpenAI GPT-4o Mini',
      'context' => {
        'openai_api_key' => 'test-api-key'
      }
    }
  end

  before do
    allow(Settings).to receive(:ai_providers).and_return([ai_provider_config])
  end

  describe 'validations' do
    it { should validate_presence_of(:model_id) }

    describe 'type specific validation for platform level assistants' do
      context 'when creating a development_actions_assistant' do
        it 'allows creation of the first development_actions_assistant' do
          assistant = build(:assistant, assistant_type: 'development_actions_assistant')
          expect(assistant).to be_valid
        end

        it 'prevents creation of a second development_actions_assistant through type-specific validation' do
          create(:assistant, assistant_type: 'development_actions_assistant')
          duplicate_assistant = build(:assistant, assistant_type: 'development_actions_assistant')

          expect(duplicate_assistant).not_to be_valid
          expect(duplicate_assistant.errors[:assistant_type]).to include(
            I18n.t('administration.ai_assistants.errors.platform_assistant_already_exists',
                   type: 'development_actions_assistant')
          )
        end

        it 'allows updating an existing development_actions_assistant' do
          assistant = create(:assistant, assistant_type: 'development_actions_assistant')
          assistant.name = 'Updated Name'

          expect(assistant).to be_valid
        end
      end

      context 'when creating non-platform level assistants' do
        it 'allows multiple assistants of other types' do
          create(:assistant, assistant_type: 'content_writer')
          duplicate_assistant = build(:assistant, assistant_type: 'content_writer')

          expect(duplicate_assistant).to be_valid
        end
      end
    end
  end

  describe '#for_user' do
    let(:user) { create(:user) }
    let(:chat) { instance_double('AI::AssistantChat') }
    let(:llm_chat) { double('LLM Chat') }
    let(:llm_context) { double('context') }

    before do
      allow(assistant.chats).to receive(:create!).and_return(chat)
      allow(chat).to receive(:with_instructions)
      allow(chat).to receive(:with_schema).and_return(chat)
      allow(chat).to receive(:with_tools).and_return(chat)
      allow(chat).to receive(:with_params).and_return(chat)
      allow(chat).to receive(:to_llm).and_return(llm_chat)
      allow(llm_chat).to receive(:with_context)
      allow(assistant).to receive(:ruby_llm_context).and_return(llm_context)
    end

    it 'creates a chat for the user and sets instructions and passes the correct context' do
      expect(assistant.chats).to receive(:create!).with(
        ai_assistant: assistant,
        user: user,
        model: assistant.model_id,
        provider: nil,
        assume_model_exists: false
      ).and_return(chat)
      expect(chat).to receive(:with_instructions).with(assistant.system_prompt)
      expect(llm_chat).to receive(:with_context).with(llm_context)

      assistant.for_user(user)
    end

    it 'includes output_schema_keys context in instructions for content_writer type assistant' do
      content_writer_assistant = build(:assistant, assistant_type: 'content_writer')
      schema_key = build(:assistant_output_schema_key, ai_assistant: content_writer_assistant)
      content_writer_assistant.assistant_output_schema_keys = [schema_key]

      allow(content_writer_assistant.chats).to receive(:create!).and_return(chat)
      allow(chat).to receive(:with_schema).and_return(chat)
      allow(chat).to receive(:to_llm).and_return(llm_chat)
      allow(llm_chat).to receive(:with_context)
      allow(content_writer_assistant).to receive(:ruby_llm_context).and_return(llm_context)

      captured_instructions = nil
      allow(chat).to receive(:with_instructions) do |instructions|
        captured_instructions = instructions
      end

      content_writer_assistant.for_user(user)

      expect(captured_instructions).to include('<assistant_output_schema>')
      expect(captured_instructions).to include(
        "- **#{schema_key.key}** (#{schema_key.key_type}): #{schema_key.description}"
      )
    end

    it 'includes output schema context for IdpAssistant in instructions' do
      idp_assistant = build(:assistant, assistant_type: 'idp_assistant')

      allow(idp_assistant.chats).to receive(:create!).and_return(chat)
      allow(chat).to receive(:with_params).and_return(chat)
      allow(chat).to receive(:to_llm).and_return(llm_chat)
      allow(llm_chat).to receive(:with_context)
      allow(idp_assistant).to receive(:ruby_llm_context).and_return(llm_context)

      allow(idp_assistant).to receive(:has_ruby_llm_schema?).and_return(true)
      allow(idp_assistant).to receive(:output_schema_class).and_return(AI::OutputSchemas::IdpAssistant)

      captured_instructions = nil
      allow(chat).to receive(:with_instructions) do |instructions|
        captured_instructions = instructions
      end

      expect(chat).to receive(:with_schema).with(AI::OutputSchemas::IdpAssistant).and_return(chat)

      idp_assistant.for_user(user)

      schema_context = AI::OutputSchemas::IdpAssistant.context
      expected_instructions = <<~EXPECTED
        #{idp_assistant.system_prompt}
        #{schema_context}
      EXPECTED

      expect(captured_instructions).to eq(expected_instructions.strip)
    end
  end

  describe 'deletion and cascading' do
    let(:user) { create(:user) }
    let(:assistant) { create(:assistant) }
    let(:chat) { create(:assistant_chat, ai_assistant: assistant, user: user) }
    let(:request1) { create(:assistant_request, ai_assistant_chat: chat) }
    let(:request2) { create(:assistant_request, ai_assistant_chat: chat) }

    context 'when assistant has tool calls' do
      let!(:tool_call1) { create(:assistant_tool_call, ai_assistant_request: request1) }
      let!(:tool_call2) { create(:assistant_tool_call, ai_assistant_request: request2) }
      let!(:result_request) do
        create(:assistant_request, ai_assistant_chat: chat, ai_assistant_tool_call_id: tool_call1.id)
      end

      it 'deletes all associated records when assistant is destroyed' do
        expect(AI::AssistantChat.where(ai_assistant: assistant)).to exist
        expect(AI::AssistantRequest.where(ai_assistant_chat: chat)).to exist
        expect(AI::AssistantToolCall.where(ai_assistant_request: [request1, request2])).to exist
        expect(AI::AssistantRequest.where(parent_tool_call: tool_call1)).to exist

        # Delete the assistant
        expect { assistant.destroy! }.not_to raise_error

        expect(AI::AssistantChat.where(ai_assistant: assistant)).not_to exist
        expect(AI::AssistantRequest.where(ai_assistant_chat: chat)).not_to exist
        expect(AI::AssistantToolCall.where(ai_assistant_request: [request1, request2])).not_to exist
        expect(AI::AssistantRequest.where(parent_tool_call: tool_call1)).not_to exist
      end

      it 'deletes tool calls when request is deleted' do
        expect(AI::AssistantToolCall.where(ai_assistant_request: request1)).to exist

        request1.destroy!

        expect(AI::AssistantToolCall.where(ai_assistant_request: request1)).not_to exist
      end

      it 'nullifies parent_tool_call when tool call is deleted' do
        expect(result_request.reload.parent_tool_call).to eq(tool_call1)

        tool_call1.destroy!

        expect(result_request.reload.parent_tool_call).to be_nil
      end
    end

    context 'when assistant is used in campaigns' do
      let(:assistant) { create(:assistant) }

      it 'prevents deletion when assistant is referenced by campaign artifacts' do
        campaign_artifact = create(:campaign_ai_artifact, ai_assistant: assistant)

        expect { assistant.destroy! }.to raise_error(ActiveRecord::RecordNotDestroyed)

        expect(assistant.errors[:base]).to include(
          I18n.t('administration.ai_assistants.errors.cannot_delete_in_use', name: assistant.name)
        )

        expect(AI::Assistant.find(assistant.id)).to eq(assistant)

        expect(AI::CampaignArtifact.find(campaign_artifact.id)).to eq(campaign_artifact)
      end

      it 'allows deletion when no campaign artifacts reference the assistant' do
        expect { assistant.destroy! }.not_to raise_error
        expect(AI::Assistant.where(id: assistant.id)).not_to exist
      end
    end
  end
end
