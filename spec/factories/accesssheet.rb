# frozen_string_literal: true

FactoryBot.define do
  factory :accesssheet do
    project { nil }
    columns { [{ name: 'Email', type: 'String' }] }
    type { 'Accesssheet' }
  end
end
