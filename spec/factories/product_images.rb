# frozen_string_literal: true

FactoryBot.define do
  factory :product_image do
    image { 'MyString' }
    position { 1 }
  end
end
