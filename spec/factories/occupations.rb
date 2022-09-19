# frozen_string_literal: true

FactoryBot.define do
  factory :occupation do
    sequence(:name) { |i| "occupation #{i}" }
    description { 'Lorem ipsum dolor sit amet.' }
    dimension
  end
end
