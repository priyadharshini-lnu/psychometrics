# frozen_string_literal: true

FactoryBot.define do
  factory :assistant, class: 'AI::Assistant' do
    sequence(:name) { |n| "Test Assistant #{n}" }
    description { 'This is a test assistant' }
    assistant_type { 'content_writer' }
    user_prompt { 'Ask me anything' }
    system_prompt { 'Be helpful and concise' }
    model_id { 'gpt-4o-mini' }
    dependencies { [] }

    association :owner, factory: :tenancy
    association :last_modified_by, factory: :user

    trait :with_datasheet_dependency do
      dependencies { ['datasheet'] }
    end

    trait :with_campaign_factors_dependency do
      dependencies { ['campaign_factors'] }
    end

    trait :with_assessments_dependency do
      dependencies { ['assessments'] }
    end

    trait :with_all_dependencies do
      dependencies { %w[datasheet campaign_factors assessments] }
    end
  end
end
