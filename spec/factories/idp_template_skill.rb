# frozen_string_literal: true

FactoryBot.define do
  factory :idp_template_skill do
    idp_template
    skill
    category { :required }
    scoring_source { :campaign_factor }
    campaign_factor_code { Faker::Lorem.characters(number: 5) }
    desired_rating { 4.5 }
    min_rating { 0 }
    max_rating { 5 }
    assessment_score_type { :norm_score }
  end
end
