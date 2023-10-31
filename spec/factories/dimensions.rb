# frozen_string_literal: true

FactoryBot.define do
  factory :dimension do
    sequence(:name) { |i| "dimension #{i}" }
    skip_owner_validation { true }

    trait :with_factor do
      after(:create) do |dimension, _|
        create(:factor, dimension: dimension)
      end
    end

    trait :with_subfactor do
      after(:create) do |dimension, _evaluator|
        factor = create :factor, dimension: dimension
        create :factor, dimension: dimension, parent_id: factor.id
      end
    end

    trait :with_occupation do
      after(:create) do |dimension, _evaluator|
        create :occupation, dimension: dimension
      end
    end

    trait :with_multiple_occupations do
      after(:create) do |dimension, _|
        create :occupation, dimension: dimension
        create :occupation, dimension: dimension
      end
    end

    trait :with_audit_log do
      after(:create) do |dimension, _|
        create(:audit_log, payload: dimension.previous_changes, record_id: dimension.id)
      end
    end
  end
end
