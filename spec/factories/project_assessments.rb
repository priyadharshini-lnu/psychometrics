# frozen_string_literal: true

FactoryBot.define do
  factory :project_assessment do
    assessment
    project { create(:project) }
    normalize_factor_scores { false }
  end
end
