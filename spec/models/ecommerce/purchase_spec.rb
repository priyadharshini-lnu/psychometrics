# == Schema Information
#
# Table name: ecommerce_purchases
#
#  id             :integer          not null, primary key
#  order_id       :integer
#  product_id     :integer
#  price_cents    :integer          default(0), not null
#  price_currency :string           default("USD"), not null
#  quantity       :integer          default(1)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

require 'rails_helper'

RSpec.describe Ecommerce::Purchase, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
