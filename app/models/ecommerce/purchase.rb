module Ecommerce
  class Purchase < ApplicationRecord
    belongs_to :order, class_name: 'Ecommerce::Order'
    belongs_to :product
    monetize :price_cents
  end
end
