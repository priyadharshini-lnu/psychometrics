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

FactoryGirl.define do
  factory :ecommerce_purchase, class: 'Ecommerce::Purchase' do
    
  end
end
