# frozen_string_literal: true

FactoryBot.define do
  factory :product do
    sequence(:name) { |n| "Product #{n}" }
    description { 'Description' }
    trait :with_image do
      after :create do |product|
        product.update_column(:image, 'foo/bar/baz.png')
      end
    end
    trait :with_prices do
      after(:create) do |product, _evaluator|
        %w[USD EUR].each do |currency|
          create :product_price, product: product, cost: 100, price_currency: currency
        end
      end
    end
  end
end
