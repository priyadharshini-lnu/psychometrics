# frozen_string_literal: true

FactoryBot.define do
  factory :integration do
    project
    name { Integration.names.keys.first }

    trait :hogan_integration do
      name { 'hogan' }
      config { { provider: 'mercer' } }
    end
  end
end
