# frozen_string_literal: true

FactoryBot.define do
  factory :occupations_factor do
    occupation
    factor
    predicate { :equal_to }
    value { 3.0 }
    weight { 1.0 }
  end
end
