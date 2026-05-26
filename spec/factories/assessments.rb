# frozen_string_literal: true

FactoryBot.define do
  factory :assessment, class: Assessments::Common do
    sequence(:name) { |i| "assessment #{i}" }
    description { Faker::Lorem.characters(number: 5) }
    dimension
    type { Assessments::Common }
    extra { { icon_color: '#845EC2' } }

    trait :with_report do
      after(:create) do |assessment, _evaluator|
        create :report, assessments: [assessment]
      end
    end

    trait :with_same_owner_dimension do
      after(:create) do |assessment, _evaluator|
        if assessment.dimension && assessment.owner.present?
          assessment.dimension.update!(owner: assessment.owner)
        end
      end
    end

    factory :hogan_assessment, class: '::Assessments::Hogan' do
      category { Assessment::CATEGORIES[:hogan] }
      type { Assessments::Hogan }
      external_settings { { assessment_id: 'HDS' } }
    end

    trait :iiht do
      category { Assessment::CATEGORIES[:iiht] }
      type { Assessments::Iiht }
      external_settings { { assessment_id: 'assessmentId' } }
    end

    trait :saville do
      category { Assessment::CATEGORIES[:saville] }
      type { Assessments::Saville }
      external_settings { { assessment_id: 'assessmentId' } }
    end

    trait :pearson do
      category { Assessment::CATEGORIES[:pearson] }
      type { Assessments::Pearson }
      external_settings { { assessment_id: 'assessmentId' } }
    end

    trait :mettl do
      category { Assessment::CATEGORIES[:mettl] }
      type { Assessments::Mettl }
      external_settings { { assessment_id: 'assessmentId' } }
    end

    trait :simulation do
      category { Assessment::CATEGORIES[:simulation] }
      type { Assessments::Simulation }
      external_settings { { assessment_id: 'assessmentId' } }
    end

    trait :skillvue do
      category { Assessment::CATEGORIES[:skillvue] }
      type { Assessments::Skillvue }
      external_settings { { assessment_id: '36d0676c454f67d39e67aee0699a2edd' } }
    end

    trait :yoodli do
      category { Assessment::CATEGORIES[:yoodli] }
      type { Assessments::Yoodli }
      external_settings { { assessment_id: 'assessmentId' } }
    end

    trait :mhs do
      category { Assessment::CATEGORIES[:mhs] }
      type { Assessments::Mhs }
      external_settings { { assessment_id: 'assessmentId' } }
    end

    trait :microsite do
      category { Assessment::CATEGORIES[:microsite] }
      type { Assessments::Microsite }
      external_settings { { assessment_id: 'microsite-assessment-id' } }
    end
  end

  factory :assessment_hogan, class: 'Assessments::Hogan' do
    sequence(:name) { |i| "hogan assessment #{i}" }
    extra { { icon_color: '#845EC2' } }
    external_settings { { assessment_id: 'assessmentId' } }
  end
end
