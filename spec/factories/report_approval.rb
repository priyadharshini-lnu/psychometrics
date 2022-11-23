# frozen_string_literal: true

FactoryBot.define do
  factory :report_approval do
    user
    campaign
    report
  end
end
