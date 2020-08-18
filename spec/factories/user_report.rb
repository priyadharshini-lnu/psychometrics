# frozen_string_literal: true

FactoryBot.define do
  factory :user_report do
    user
    campaign
    report
  end
end
