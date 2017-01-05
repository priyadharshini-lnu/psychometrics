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

FactoryGirl.define do
  factory :product_report do
    product ""
    report ""
  end
end
