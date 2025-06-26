# frozen_string_literal: true

FactoryBot.define do
  factory :assistant_request, class: 'AI::AssistantRequest' do
    association :chat, factory: :assistant_chat
    association :ai_assistant, factory: :assistant

    role { 'user' }
    content { 'This is a test message' }
    model_id { 'gpt-4o-mini' }
    input_tokens { 10 }
    output_tokens { 20 }
  end
end
