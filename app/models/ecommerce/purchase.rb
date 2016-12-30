module Ecommerce
  class Purchase < ApplicationRecord
    belongs_to :order, class_name: 'Ecommerce::Order', inverse_of: :purchases
    belongs_to :product
    has_many :invites, inverse_of: :purchase, class_name: 'Ecommerce::PurchaseInvite', dependent: :destroy
    accepts_nested_attributes_for :invites

    validates :product, :order, :price, presence: true

    after_initialize :set_price, :init_invites, if: :new_record?

    # Save price of product
    monetize :price_cents

    def subtotal
      price * quantity
    end

    private

    # Find and set product price with specified currency
    def set_price
      self.price = price_currency && product&.prices.find_by(price_currency: price_currency)&.price
    end

    # In dependent of quantity products
    # Init invites
    def init_invites
      (quantity - invites.size).to_i.times do |i|
        invites.build(email: i.zero? ? order&.membership&.user&.email : '')
      end
    end
  end
end
