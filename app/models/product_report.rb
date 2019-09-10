# frozen_string_literal: true

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

class ProductReport < ApplicationRecord
  belongs_to :product
  belongs_to :report
end
