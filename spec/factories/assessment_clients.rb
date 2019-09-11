# frozen_string_literal: true

FactoryGirl.define do
  factory :assessments_client do
    assessment
    client
  end
end
