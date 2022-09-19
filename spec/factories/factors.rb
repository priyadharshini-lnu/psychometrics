# frozen_string_literal: true

FactoryBot.define do
  factory :factor do
    sequence(:name) { |i| "factor #{i}" }
    description { 'Lorem ipsum dolor sit amet.' }
    dimension

    trait :with_subfactor do
      after(:create) do |factor, _evaluator|
        create :factor, dimension: factor.dimension, parent_id: factor.id
      end
    end
  end
end
