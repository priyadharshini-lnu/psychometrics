# frozen_string_literal: true

# == Schema Information
#
# Table name: ecommerce_orders
#
#  id            :integer          not null, primary key
#  membership_id :integer
#  status        :integer          default("in_proccess")
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

module Ecommerce
  class Order < ApplicationRecord
    belongs_to :membership, class_name: 'Membership', inverse_of: :orders

    has_many :purchases, inverse_of: :order, dependent: :destroy, class_name: 'Ecommerce::Purchase'

    accepts_nested_attributes_for :purchases,
                                  reject_if: proc { |attributes| attributes['product_id'].blank? },
                                  allow_destroy: true

    validates :membership, :purchases, presence: true
    validate :equivalent_currencies

    enum status: { in_proccess: 0, completed: 1, cancelled: 2, failed: 3 }

    private

    def equivalent_currencies
      errors.add(:base, :invalid) unless purchases.map(&:price_currency).uniq.one?
    end
  end
end
