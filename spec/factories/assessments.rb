# frozen_string_literal: true

FactoryBot.define do
  factory :assessment, class: ::Assessments::Common do
    sequence(:name) { |i| "assessment #{i}" }
    description { Faker::Lorem.characters(number: 5) }
    dimension
    extra { { icon_color: '#845EC2' } }

    trait :with_report do
      after(:create) do |assessment, _evaluator|
        create :report, assessments: [assessment]
      end
    end

    factory :hogan_assessment, class: ::Assessments::Hogan do
      category { Assessment::CATEGORIES[:hogan] }
      type { ::Assessments::Hogan }
      dimension { nil }

      after(:create) { |assessment| create(:hogan_assessment_setting, assessment: assessment) }
    end

    trait :iiht do
      category { Assessment::CATEGORIES[:iiht] }
      type { ::Assessments::Iiht }
      dimension { nil }
      after(:create) { |assessment| create(:iiht_assessment_setting, assessment: assessment) }
    end

    trait :saville do
      category { Assessment::CATEGORIES[:saville] }
      type { ::Assessments::Saville }
      dimension { nil }
      after(:create) { |assessment| create(:saville_assessment_setting, assessment: assessment) }
    end

    trait :pearson do
      category { Assessment::CATEGORIES[:pearson] }
      type { ::Assessments::Pearson }
      dimension { nil }
      after(:create) { |assessment| create(:pearson_assessment_setting, assessment: assessment) }
    end
  end
  factory :assessment_hogan, class: ::Assessments::Hogan do
    sequence(:name) { |i| "hogan assessment #{i}" }
    extra { { icon_color: '#845EC2' } }
  end
end
