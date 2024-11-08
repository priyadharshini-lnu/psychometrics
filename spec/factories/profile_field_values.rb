# frozen_string_literal: true

FactoryBot.define do
  factory :profile_field_value do
    numeric_value { 1.5 }
    string_value { 'MyString' }
  end
end
