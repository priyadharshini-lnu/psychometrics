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

class ProductPrice < ApplicationRecord
  attr_accessor :cost
  belongs_to :product
  monetize :price_cents

  def cost=(value)
    self.price_cents = (value.to_f * price.currency.subunit_to_unit).to_i
  end

  def cost
    price.zero? ? nil : price
  end
end
