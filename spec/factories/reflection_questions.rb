# frozen_string_literal: true

FactoryBot.define do
  factory :reflection_question do
    question { 'What is your favorite color?' }
    association :project
  end
end
