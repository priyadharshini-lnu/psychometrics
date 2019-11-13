# frozen_string_literal: true

FactoryGirl.define do
  factory :norm do
    sequence(:name) { |n| "Norm #{n}" }
    dimension
    association :owner, factory: :tenancy

    transient do
      with_factors_norm true
      factors_norm_count 5
    end

    after(:create) do |norm, evaluator|
      if evaluator.with_factors_norm
        evaluator.factors_norm_count.times do
          factor = create(:factor, dimension: norm.dimension)
          FactorsNorm::NORM_TYPES.each do |type|
            create(:factors_norm, type: type, norm: norm, factor: factor)
          end
        end
      end
    end
  end
end
