module Ecommerce
  class PurchaseInvite < ApplicationRecord
    belongs_to :purchase, class_name: 'Ecommerce::Purchase', inverse_of: :invites
    validates :email, presence: true, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i }
  end
end
