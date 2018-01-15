# == Schema Information
#
# Table name: communication_emails
#
#  id               :integer          not null, primary key
#  membership_id    :integer
#  communication_id :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#

FactoryGirl.define do
  factory :communication_email do
    membership
    communication { create(:communication) }
  end
end
