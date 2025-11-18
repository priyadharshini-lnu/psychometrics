# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::AssistantRequest, type: :model do
  describe 'token usage tracking' do
    let(:chat) { create(:assistant_chat, input_tokens: 0, output_tokens: 0) }

    it 'updates chat token counts when messages with tokens are created' do
      expect do
        create(:assistant_request,
               ai_assistant_chat: chat,
               role: 'assistant',
               input_tokens: 10,
               output_tokens: 5)
      end.to change { chat.reload.input_tokens }.from(0).to(10).
        and change { chat.reload.output_tokens }.from(0).to(5)

      expect do
        create(:assistant_request,
               ai_assistant_chat: chat,
               role: 'assistant',
               input_tokens: 2,
               output_tokens: 3)
      end.to change { chat.reload.input_tokens }.from(10).to(12).
        and change { chat.reload.output_tokens }.from(5).to(8)
    end

    it 'does not update chat token counts for messages without tokens' do
      expect do
        create(:assistant_request,
               ai_assistant_chat: chat,
               role: 'assistant',
               input_tokens: nil,
               output_tokens: nil)
      end.not_to(change { chat.reload.input_tokens })
    end
  end
end
