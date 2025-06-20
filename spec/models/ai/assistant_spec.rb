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
      allow(assistant).to receive(:system_prompt)
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
end
