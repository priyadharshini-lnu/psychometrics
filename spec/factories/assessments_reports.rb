# frozen_string_literal: true

FactoryBot.define do
  factory :assessments_report do
    assessment
    report
  end
end
