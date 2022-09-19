# frozen_string_literal: true

FactoryBot.define do
  factory :innovation_style do
    sequence(:name) { |i| "IS #{i}" }
    sequence(:description) { |j| "Innovation Style #{j}" }
    dimension
  end
end
