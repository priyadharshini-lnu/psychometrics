# frozen_string_literal: true

FactoryBot.define do
  factory :assistant_tool_call, class: 'AI::AssistantToolCall' do
    tool_call_id { "call_#{SecureRandom.hex(12)}" }
    name { 'test_function' }
    arguments { { param1: 'value1', param2: 'value2' } }
  end
end
