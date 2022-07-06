# frozen_string_literal: true

FactoryBot.define do
  factory :datasheet do
    project { nil }
    columns { [{ name: 'Email', type: 'String' }] }
  end
end
