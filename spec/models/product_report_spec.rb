# == Schema Information
#
# Table name: product_reports
#
#  id         :integer          not null, primary key
#  product_id :integer
#  report_id  :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'rails_helper'

RSpec.describe ProductReport, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
