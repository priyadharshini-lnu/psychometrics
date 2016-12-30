module Ecommerce
  class Order < ApplicationRecord
    belongs_to :membership, class_name: 'Membership', inverse_of: :orders
    has_many :purchases, inverse_of: :order, dependent: :destroy, class_name: 'Ecommerce::Purchase'
    accepts_nested_attributes_for :purchases,
                                  reject_if: proc { |attributes| attributes['product_id'].blank? },
                                  allow_destroy: true
    #  || attributes['price_cents'].blank?
    validates :membership, :purchases, presence: true
    validate :equivalent_currencies

    enum status: [:in_proccess, :completed, :cancelled, :failed]

    private

    def equivalent_currencies
      errors.add(:base, :invalid) unless purchases.map(&:price_currency).uniq.one?
    end
  end
end
