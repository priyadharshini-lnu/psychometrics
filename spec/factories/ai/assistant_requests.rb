# frozen_string_literal: true

FactoryBot.define do
  factory :assistant_request, class: 'AI::AssistantRequest' do
    association :ai_assistant_chat, factory: :assistant_chat

    role { 'user' }
    content { 'This is a test message' }
    model_id_string { 'gpt-4o-mini' }
    input_tokens { 10 }
    output_tokens { 20 }
  end
end
