# frozen_string_literal: true

FactoryGirl.define do
  factory :assessments_report do
    assessment
    report
  end
end
