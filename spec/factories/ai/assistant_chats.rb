# frozen_string_literal: true

FactoryBot.define do
  factory :assistant_chat, class: 'AI::AssistantChat' do
    association :ai_assistant, factory: :assistant
    association :user

    model_id { 'gpt-4o-mini' }

    trait :with_messages do
      after(:create) do |chat|
        create_list(:assistant_request, 3, chat: chat)
      end
    end
  end
end
