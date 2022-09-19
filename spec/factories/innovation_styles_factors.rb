# frozen_string_literal: true

FactoryBot.define do
  factory :innovation_styles_factor do
    innovation_style
    factor
    predicate { :equal_to }
    value { 3.0 }
    weight { 1.0 }
  end
end
