# frozen_string_literal: true

FactoryBot.define do
  factory :user_assessment_factor_score do
    user_assessment { nil }
    factor { nil }
    score { 1.5 }
    score { 1.5 }
    zscore { 1.5 }
    norm_score { 1.5 }
    percentage { 1.5 }
  end
end
