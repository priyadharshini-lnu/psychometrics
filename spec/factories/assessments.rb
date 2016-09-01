# == Schema Information
#
# Table name: assessments
#
#  id         :integer          not null, primary key
#  name       :string
#  category   :enum             default("psychometric")
#  norm_id    :integer
#  disabled   :boolean          default(FALSE)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  flow       :json
#

FactoryGirl.define do
  factory :assessment do
    sequence(:name) { |i| "assessment #{i}" }
  end
end
