# == Schema Information
#
# Table name: assessments
#
#  id                :integer          not null, primary key
#  name              :string
#  category          :enum             default("psychometric")
#  dimension_id      :integer
#  disabled          :boolean          default(FALSE)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  flow              :json
#  norm_rules        :json
#  description       :text
#  timing            :string
#  access_reports_at :datetime
#  status            :integer
#  owner_id          :integer
#

FactoryGirl.define do
  factory :assessment do
    sequence(:name) { |i| "assessment #{i}" }
    dimension

    trait :with_report do
      after(:create) do |assessment, _evaluator|
        create :report, assessment: assessment
      end
    end
  end
end
