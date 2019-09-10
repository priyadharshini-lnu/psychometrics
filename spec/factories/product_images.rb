# frozen_string_literal: true

# == Schema Information
#
# Table name: product_images
#
#  id         :integer          not null, primary key
#  image      :string
#  position   :integer
#  product_id :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

FactoryGirl.define do
  factory :product_image do
    image 'MyString'
    position 1
  end
end
