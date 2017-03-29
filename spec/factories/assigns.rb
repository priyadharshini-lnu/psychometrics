FactoryGirl.define do
  factory :assign do
    membership
    assessment

    factory :assign_assessment do
      association :profile, factory: :assessment
    end
  end
end
