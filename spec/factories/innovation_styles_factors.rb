# == Schema Information
#
# Table name: innovation_styles_factors
#
#  id                  :bigint(8)        not null, primary key
#  innovation_style_id :bigint(8)
#  factor_id           :bigint(8)
#  predicate           :string
#  value               :float
#  position            :integer
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#

FactoryGirl.define do
  factory :innovation_styles_factor do
    innovation_style
    factor
    predicate { :equal_to }
    value { 3.0 }
  end
end
