# frozen_string_literal: true

FactoryGirl.define do
  factory :question_recoding do
    assessment
    question
  end
end
