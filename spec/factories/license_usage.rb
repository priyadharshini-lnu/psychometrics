FactoryGirl.define do
  factory :license_usage do
    association :client, factory: :tenancy
  end
end
