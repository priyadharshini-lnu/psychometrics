# frozen_string_literal: true

FactoryBot.define do
  factory :assessment_assistant do
    assessment
    ai_assistant { association :assistant }
    assessment_prompt { 'Test prompt' }
  end
end
