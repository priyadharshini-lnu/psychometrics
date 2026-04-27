# frozen_string_literal: true

FactoryBot.define do
  factory :ai_model_registry, class: 'AI::ModelRegistry' do
    sequence(:model_id) { |n| "gpt-4o-mini-#{n}" }
    sequence(:name) { |n| "GPT-4o Mini #{n}" }
    provider { 'openai' }
  end
end
