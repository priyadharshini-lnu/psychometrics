# frozen_string_literal: true

FactoryBot.define do
  factory :assistant_tool_call, class: 'AI::AssistantToolCall' do
    association :message, factory: :assistant_request

    sequence(:tool_call_id) { |n| "call_#{SecureRandom.hex(8)}_#{n}" }
    name { 'test_function' }
    arguments { { param1: 'value1', param2: 'value2' } }
  end
end
