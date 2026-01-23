# frozen_string_literal: true

FactoryBot.define do
  factory :ai_translation_result, class: 'AI::TranslationResult' do
    results { '' }
  end
end
