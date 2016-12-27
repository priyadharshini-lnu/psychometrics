module Ecommerce
  class Order < ApplicationRecord
    belongs_to :membership, class_name: 'Membership', inverse_of: :orders
    has_many :purchases, dependent: :destroy, class_name: 'Ecommerce::Purchase'

    enum status: [:in_proccess, :completed, :cancelled, :failed]
  end
end
