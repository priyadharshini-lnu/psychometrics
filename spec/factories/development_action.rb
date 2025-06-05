# frozen_string_literal: true

FactoryBot.define do
  factory :development_action do
    name { Faker::Lorem.characters(number: 5) }
    description { Faker::Lorem.sentence }
    development_action_type { DevelopmentAction.development_action_types.keys.sample }
    learning_style { DevelopmentAction.learning_styles.keys.sample }
    course_provider { '' }
    course_url { '' }
  end
end
