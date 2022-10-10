# frozen_string_literal: true

FactoryBot.define do
  factory :profile_field do
    required { false }
    half_size { false }
    position { 1 }
  end
end
