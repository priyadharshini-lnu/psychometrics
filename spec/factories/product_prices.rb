# frozen_string_literal: true

# == Schema Information
#
# Table name: product_prices
#
#  id             :integer          not null, primary key
#  price_cents    :integer          default(0), not null
#  price_currency :string           default("USD"), not null
#  product_id     :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

FactoryGirl.define do
  factory :product_price do
  end
end
