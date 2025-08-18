# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::Assistant, type: :model do
  subject(:assistant) { build(:assistant) }

  describe 'validations' do
    it { should validate_presence_of(:model_id) }
  end

  describe '#for_user' do
    let(:user) { create(:user) }
    let(:chat) { instance_double('AI::AssistantChat') }
    let(:llm_context) { double('context') }

    before do
      allow(assistant.chats).to receive(:create!).and_return(chat)
      allow(chat).to receive(:with_instructions)
      allow(chat).to receive(:with_context)
      allow(assistant).to receive(:ruby_llm_context).and_return(llm_context)
    end

    it 'creates a chat for the user and sets instructions and passes the correct context' do
      expect(assistant.chats).to receive(:create!).with(ai_assistant: assistant, user: user,
                                                        model_id: assistant.model_id).and_return(chat)
      expect(chat).to receive(:with_instructions).with(assistant.system_prompt)
      expect(chat).to receive(:with_context).with(llm_context)

      assistant.for_user(user)
    end
  end

  # This is required to ensure ruby_llm default behaviour is retained even with diferent naming conventions
  describe 'deletion and cascading' do
    let(:user) { create(:user) }
    let(:assistant) { create(:assistant) }
    let(:chat) { create(:assistant_chat, ai_assistant: assistant, user: user) }
    let(:request1) { create(:assistant_request, chat: chat) }
    let(:request2) { create(:assistant_request, chat: chat) }

    context 'when assistant has tool calls' do
      let!(:tool_call1) { create(:assistant_tool_call, message: request1) }
      let!(:tool_call2) { create(:assistant_tool_call, message: request2) }
      let!(:result_request) { create(:assistant_request, chat: chat, parent_tool_call: tool_call1) }

      it 'deletes all associated records when assistant is destroyed' do
        expect(AI::AssistantChat.where(ai_assistant: assistant)).to exist
        expect(AI::AssistantRequest.where(chat: chat)).to exist
        expect(AI::AssistantToolCall.where(message: [request1, request2])).to exist
        expect(AI::AssistantRequest.where(parent_tool_call: tool_call1)).to exist

        # Delete the assistant
        expect { assistant.destroy! }.not_to raise_error

        expect(AI::AssistantChat.where(ai_assistant: assistant)).not_to exist
        expect(AI::AssistantRequest.where(chat: chat)).not_to exist
        expect(AI::AssistantToolCall.where(message: [request1, request2])).not_to exist
        expect(AI::AssistantRequest.where(parent_tool_call: tool_call1)).not_to exist
      end

      it 'deletes tool calls when request is deleted' do
        expect(AI::AssistantToolCall.where(message: request1)).to exist

        request1.destroy!

        expect(AI::AssistantToolCall.where(message: request1)).not_to exist
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
