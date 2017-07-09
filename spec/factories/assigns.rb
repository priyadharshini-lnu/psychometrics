FactoryGirl.define do
  factory :assign do
    membership
    assessment { membership.client.assessments.take }

    factory :assign_assessment do
      association :profile, factory: :assessment
    end
  end
end
