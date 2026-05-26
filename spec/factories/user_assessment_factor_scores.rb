# frozen_string_literal: true

FactoryBot.define do
  factory :user_assessment_factor_score do
    user_assessment { nil }
    factor { nil }
    scores { {} }
  end
end
