# frozen_string_literal: true

FactoryBot.define do
  factory :yoodli_assessment do
    sequence(:product_id) { |n| "yoodli-product-#{n}" }
    name { "Assessment #{product_id}" }
    project
  end
end
