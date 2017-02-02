FactoryGirl.define do
  factory :assign do
    membership

    factory :assign_assessment do
      association :profile, factory: :assessment
    end
  end
end
