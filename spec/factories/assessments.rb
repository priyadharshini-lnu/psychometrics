# == Schema Information
#
# Table name: assessments
#
#  id           :integer          not null, primary key
#  name         :string
#  category     :enum             default("psychometric")
#  dimension_id :integer
#  disabled     :boolean          default(FALSE)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  flow         :json
#  norm_rules   :json
#

FactoryGirl.define do
  factory :assessment do |f|
    f.sequence(:name) { |i| "assessment #{i}" }
    f.association :dimension
  end
end
