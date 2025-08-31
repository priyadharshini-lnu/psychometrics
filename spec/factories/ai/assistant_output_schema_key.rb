# frozen_string_literal: true

FactoryBot.define do
  factory :assistant_output_schema_key, class: 'AI::AssistantOutputSchemaKey' do
    association :ai_assistant, factory: :assistant

    sequence(:key) { |n| "key_#{n}" }
    sequence(:description) { |n| "Description for key #{n}" }
    key_type { 'string' }
  end
end
