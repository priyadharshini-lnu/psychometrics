# frozen_string_literal: true

FactoryBot.define do
  factory :block do
    sequence(:name) { |i| "block #{i}" }
    assessment
  end
end
