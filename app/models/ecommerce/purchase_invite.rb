# == Schema Information
#
# Table name: ecommerce_purchase_invites
#
#  id          :integer          not null, primary key
#  purchase_id :integer
#  email       :string           not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

module Ecommerce
  class PurchaseInvite < ApplicationRecord
    belongs_to :purchase, class_name: 'Ecommerce::Purchase', inverse_of: :invites
    validates :email, presence: true, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i }
  end
end
