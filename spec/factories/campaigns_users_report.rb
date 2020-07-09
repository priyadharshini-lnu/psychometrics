# frozen_string_literal: true

FactoryBot.define do
  factory :campaigns_users_report do
    user
    campaign
    report
  end
end
