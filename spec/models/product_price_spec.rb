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

require 'rails_helper'

RSpec.describe ProductPrice, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
