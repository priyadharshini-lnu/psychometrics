# frozen_string_literal: true

FactoryGirl.define do
  factory :users_report do
    user
    campaign
    report
  end
end
