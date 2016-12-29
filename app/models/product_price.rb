class ProductPrice < ApplicationRecord
  attr_accessor :cost
  belongs_to :product
  monetize :price_cents

  def cost=(value)
    self.price_cents = (value.to_f * price.currency.subunit_to_unit).to_i
  end

  def cost
    price
  end
end
