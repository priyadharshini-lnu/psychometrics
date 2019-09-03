# == Schema Information
#
# Table name: factors
#
#  id               :integer          not null, primary key
#  name             :string
#  subfactors_count :integer          default(0)
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  dimension_id     :integer
#  parent_id        :integer
#  disabled         :boolean          default(FALSE)
#  icon             :string
#  description      :text
#

FactoryGirl.define do
  factory :occupations_factor do
    occupation
    factor
    predicate { :equal_to }
    value { 3.0 }
    weight { 1.0 }
  end
end
