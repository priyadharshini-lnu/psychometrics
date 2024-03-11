# frozen_string_literal: true

FactoryBot.define do
  factory :assessment, class: 'Assessments::Common' do
    sequence(:name) { |i| "assessment #{i}" }
    description { Faker::Lorem.characters(number: 5) }
    dimension
    extra { { icon_color: '#845EC2' } }

    trait :with_report do
      after(:create) do |assessment, _evaluator|
        create :report, assessments: [assessment]
      end
    end

    factory :hogan_assessment, class: 'Assessments::Hogan' do
      category { Assessment::CATEGORIES[:hogan] }
      type { ::Assessments::Hogan }
      external_settings { { assessment_id: 'assessmentId' } }
    end

    trait :iiht do
      category { Assessment::CATEGORIES[:iiht] }
      type { ::Assessments::Iiht }
      external_settings { { assessment_id: 'assessmentId' } }
    end

    trait :saville do
      category { Assessment::CATEGORIES[:saville] }
      type { ::Assessments::Saville }
      external_settings { { assessment_id: 'assessmentId' } }
    end

    trait :pearson do
      category { Assessment::CATEGORIES[:pearson] }
      type { ::Assessments::Pearson }
      external_settings { { assessment_id: 'assessmentId' } }
    end
  end

  factory :assessment_hogan, class: 'Assessments::Hogan' do
    sequence(:name) { |i| "hogan assessment #{i}" }
    extra { { icon_color: '#845EC2' } }
    external_settings { { assessment_id: 'assessmentId' } }
  end
end
