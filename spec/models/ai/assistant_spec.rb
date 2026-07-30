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

    describe 'skip_default_params option' do
      it 'skips default params when skip_default_params is true' do
        expect(chat).not_to receive(:with_params)

        assistant.for_user(user, skip_default_params: true)
      end

      it 'applies default params when skip_default_params is not set' do
        default_params = assistant.send(:default_params)

        expect(chat).to receive(:with_params).with(**default_params)

        assistant.for_user(user)
      end
    end

    describe 'DB model_params overrides' do
      before { allow(chat).to receive(:with_thinking) }

      context 'when model_params sets max_tokens' do
        before { assistant.model_params = { 'max_tokens' => 9999 } }

        it 'passes the DB max_tokens to the chat' do
          expect(chat).to receive(:with_params).with(hash_including(max_tokens: 9999))

          assistant.for_user(user)
        end
      end

      context 'when skip_default_params is true but model_params has max_tokens' do
        before { assistant.model_params = { 'max_tokens' => 9999 } }

        it 'still applies DB max_tokens even when type defaults are skipped' do
          expect(chat).to receive(:with_params).with(hash_including(max_tokens: 9999))

          assistant.for_user(user, skip_default_params: true)
        end
      end
    end

    describe 'thinking config' do
      before do
        allow(chat).to receive(:with_thinking)
        allow(chat).to receive(:with_params)
      end

      context 'when model_params contains thinking_effort' do
        before { assistant.model_params = { 'thinking_effort' => 'high' } }

        it 'calls with_thinking on the chat with the configured effort' do
          expect(chat).to receive(:with_thinking).with(effort: 'high', budget: nil)

          assistant.for_user(user)
        end
      end

      context 'when model_params contains thinking_budget' do
        before { assistant.model_params = { 'thinking_budget' => 10_000 } }

        it 'calls with_thinking on the chat with the configured budget' do
          expect(chat).to receive(:with_thinking).with(effort: nil, budget: 10_000)

          assistant.for_user(user)
        end
      end

      context 'when model_params contains both thinking_effort and thinking_budget' do
        before { assistant.model_params = { 'thinking_effort' => 'medium', 'thinking_budget' => 5000 } }

        it 'passes both to with_thinking' do
          expect(chat).to receive(:with_thinking).with(effort: 'medium', budget: 5000)

          assistant.for_user(user)
        end
      end

      context 'when model_params has no thinking config' do
        before { assistant.model_params = {} }

        it 'does not call with_thinking' do
          expect(chat).not_to receive(:with_thinking)

          assistant.for_user(user)
        end
      end
    end

    describe 'advanced prompting' do
      let(:user) { create(:user) }
      let(:chat) { instance_double('AI::AssistantChat') }
      let(:llm_chat) { double('LLM Chat') }
      let(:llm_context) { double('context') }
      let(:template_context) { { user: user, campaign: 'test_campaign' } }

      before do
        allow(assistant.chats).to receive(:create!).and_return(chat)
        allow(chat).to receive(:with_instructions)
        allow(chat).to receive(:with_schema).and_return(chat)
        allow(chat).to receive(:with_tools).and_return(chat)
        allow(chat).to receive(:with_params).and_return(chat)
        allow(chat).to receive(:to_llm).and_return(llm_chat)
        allow(llm_chat).to receive(:with_context)
        allow(assistant).to receive(:ruby_llm_context).and_return(llm_context)
        allow(assistant).to receive(:has_ruby_llm_schema?).and_return(false)
        allow(assistant).to receive(:output_schema_as_context).and_return('')
      end

      context 'when advanced_prompting_enabled is true' do
        before do
          assistant.advanced_prompting_enabled = true
          assistant.system_prompt = 'Hello {{ user.name }}'
        end

        it 'renders the system prompt using AI::PromptTemplate::Renderer' do
          expect(AI::PromptTemplate::Renderer).to receive(:call!).
            with(assistant.system_prompt, **template_context).
            and_return('Hello John Doe')

          captured_instructions = nil
          allow(chat).to receive(:with_instructions) do |instructions|
            captured_instructions = instructions
          end

          assistant.for_user(user, prompt_template_context: template_context)

          expect(captured_instructions).to include('Hello John Doe')
        end
      end

      context 'when advanced_prompting_enabled is false' do
        before do
          assistant.advanced_prompting_enabled = false
          assistant.system_prompt = 'Hello {{ user.name }}'
        end

        it 'uses the system prompt as-is without rendering' do
          expect(AI::PromptTemplate::Renderer).not_to receive(:call!)

          captured_instructions = nil
          allow(chat).to receive(:with_instructions) do |instructions|
            captured_instructions = instructions
          end

          assistant.for_user(user, prompt_template_context: template_context)

          expect(captured_instructions).to include('Hello {{ user.name }}')
        end
      end
    end
  end

  describe '#in_use?' do
    let(:assistant) { create(:assistant) }

    it 'returns false when not referenced anywhere' do
      expect(assistant.in_use?).to be false
    end

    it 'returns true when referenced by a campaign ai artifact' do
      create(:campaign_ai_artifact, ai_assistant: assistant)
      expect(assistant.in_use?).to be true
    end

    it 'returns true when referenced by an assessment assistant' do
      create(:assessment_assistant, ai_assistant: assistant)
      expect(assistant.in_use?).to be true
    end

    it 'returns true when assigned as one_click_ai_assistant on an idp template' do
      create(:idp_template, one_click_ai_assistant: assistant)
      expect(assistant.in_use?).to be true
    end

    it 'returns true when assigned as document_analysis_ai_assistant on an idp template' do
      create(:idp_template, document_analysis_ai_assistant: assistant)
      expect(assistant.in_use?).to be true
    end

    it 'returns true when assigned as skill_gap_report_analysis_ai_assistant on an idp template' do
      create(:idp_template, skill_gap_report_analysis_ai_assistant: assistant)
      expect(assistant.in_use?).to be true
    end
  end

  describe '#provider_previously_used?' do
    let(:user) { create(:user) }
    let(:assistant) { create(:assistant, model_id: 'gpt-4o-mini') }
    let(:current_registry) do
      AI::ModelRegistry.find_or_create_by!(model_id: 'gpt-4o-mini', provider: 'openai') do |r|
        r.name = 'GPT-4o Mini'
      end
    end
    let(:other_registry) do
      create(:ai_model_registry, model_id: 'claude-3-opus', provider: 'anthropic', name: 'Claude 3 Opus')
    end

    # Uses update_columns to bypass acts_as_chat callbacks that set ai_model_registry_id
    # from model_id_string, and to avoid triggering updated_at auto-update so travel_to works.
    def create_chat_with_output(registry:, output_tokens: 100)
      chat = create(:assistant_chat, ai_assistant: assistant, user: user)
      chat.update_columns(ai_model_registry_id: registry.id, output_tokens: output_tokens)
      chat
    end

    it 'returns false when there are no chats' do
      expect(assistant.provider_previously_used?).to be false
    end

    it 'returns false when all chats have zero output tokens' do
      create_chat_with_output(registry: current_registry, output_tokens: 0)
      expect(assistant.provider_previously_used?).to be false
    end

    it 'returns true when the most recent used chat was on the current provider' do
      create_chat_with_output(registry: current_registry)
      expect(assistant.provider_previously_used?).to be true
    end

    it 'returns false when the most recent used chat was on a different provider' do
      Timecop.freeze(1.hour.ago) do
        create_chat_with_output(registry: current_registry)
      end
      create_chat_with_output(registry: other_registry)
      expect(assistant.provider_previously_used?).to be false
    end

    it 'returns true when provider was switched away and switched back, with last usage on current provider' do
      Timecop.freeze(1.hour.ago) do
        create_chat_with_output(registry: other_registry)
      end
      create_chat_with_output(registry: current_registry)
      expect(assistant.provider_previously_used?).to be true
    end

    it 'ignores chats with nil output_tokens when finding last used' do
      Timecop.freeze(1.hour.ago) do
        create_chat_with_output(registry: current_registry, output_tokens: nil)
      end
      create_chat_with_output(registry: other_registry)
      expect(assistant.provider_previously_used?).to be false
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
