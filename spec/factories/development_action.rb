# frozen_string_literal: true

FactoryBot.define do
  factory :development_action do
    name { Faker::Lorem.characters(number: 5) }
    description { Faker::Lorem.sentence }
    development_action_type { DevelopmentAction.development_action_types.keys.sample }
    learning_style { DevelopmentAction.learning_styles.keys.sample }
    source_type { 'ai_generated' }
    course_provider { '' }
    course_url { '' }

    trait :with_project do
      association :owner, factory: :project
    end

    trait :global do
      owner { nil }
    end

    trait :custom do
      source_type { 'custom' }
      name { 'Custom Development Task' }
      description { 'Custom Development Task' }
      learning_style { 'on_the_job' }
    end
  end
end
