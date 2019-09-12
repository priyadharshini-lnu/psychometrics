# frozen_string_literal: true

# == Schema Information
#
# Table name: factors
#
#  id               :integer          not null, primary key
#  name             :string
#  subfactors_count :integer          default(0)
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  dimension_id     :integer
#  parent_id        :integer
#  disabled         :boolean          default(FALSE)
#  icon             :string
#  description      :text
#

FactoryGirl.define do
  factory :factor do
    sequence(:name) { |i| "factor #{i}" }
    dimension

    trait :with_subfactor do
      after(:create) do |factor, _evaluator|
        create :factor, dimension: factor.dimension, parent_id: factor.id
      end
    end
  end
end
