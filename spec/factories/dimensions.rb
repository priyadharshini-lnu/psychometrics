# == Schema Information
#
# Table name: dimensions
#
#  id            :integer          not null, primary key
#  name          :string
#  disabled      :boolean          default(FALSE)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  factors_count :integer          default(0)
#

FactoryGirl.define do
  factory :dimension do
    sequence(:name) { |i| "dimension #{i}" }
  end
end
