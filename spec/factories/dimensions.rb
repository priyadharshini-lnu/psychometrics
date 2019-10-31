# frozen_string_literal: true

# == Schema Information
#
# Table name: dimensions
#
#  id            :integer          not null, primary key
#  name          :string
#  disabled      :boolean          default(FALSE)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  factors_count :integer          default(0)
#  owner_id      :integer
#

FactoryGirl.define do
  factory :dimension do
    sequence(:name) { |i| "dimension #{i}" }

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
  end
end
