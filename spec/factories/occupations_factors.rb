# frozen_string_literal: true

FactoryBot.define do
  factory :occupations_factor do
    occupation
    factor
    occupation_condition_set do
      occupation.dimension.default_occupation_condition_set ||
        occupation.dimension.occupation_condition_sets.find_by(name: 'Default') ||
        create(:occupation_condition_set, dimension: occupation.dimension)
    end
    predicate { :equal_to }
    value { 3.0 }
    weight { 1.0 }
  end
end
