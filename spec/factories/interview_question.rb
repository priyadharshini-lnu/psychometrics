# frozen_string_literal: true

FactoryBot.define do
  factory :interview_question do
    question { 'What is your favorite color?' }
    description { 'What is your favorite color?' }
    time_limit { 180 }
    mandatory { true }
    question_type { 'audio' }
  end
end
