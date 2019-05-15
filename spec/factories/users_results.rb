FactoryGirl.define do
  factory :users_result do
    association :subject, factory: :user
    association :evaluator, factory: :user
    assessment
  end
end
