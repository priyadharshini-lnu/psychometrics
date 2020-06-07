# frozen_string_literal: true

FactoryBot.define do
  factory :question_recoding do
    assessment
    question
  end
end
