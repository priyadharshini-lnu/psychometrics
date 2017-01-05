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

require 'rails_helper'

RSpec.describe Ecommerce::Order, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
