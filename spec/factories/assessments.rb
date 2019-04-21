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
  factory :assessment, class: ::Assessments::Common  do
    sequence(:name) { |i| "assessment #{i}" }
    dimension
    extra { {icon_color: '#845EC2'} }

    trait :with_report do
      after(:create) do |assessment, _evaluator|
        create :report, assessment: assessment
      end
    end

    trait :hogan do
      category Assessment::CATEGORIES[:hogan]
      type ::Assessments::Hogan
      dimension nil
    end
  end
  factory :assessment_hogan, class: ::Assessments::Hogan  do
    sequence(:name) { |i| "hogan assessment #{i}" }
    extra { {icon_color: '#845EC2'} }
  end
end
