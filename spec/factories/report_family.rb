# frozen_string_literal: true

FactoryBot.define do
  factory :report_family do
    sequence(:name) { |i| "report family #{i}" }
  end
end
