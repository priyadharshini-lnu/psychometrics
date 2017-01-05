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

FactoryGirl.define do
  factory :ecommerce_order, class: 'Ecommerce::Order' do
    
  end
end
