FactoryGirl.define do
  factory :norm do
    sequence(:name) { |n| "Norm #{n}" }
    dimension
    association :owner, factory: :client
  end
end
