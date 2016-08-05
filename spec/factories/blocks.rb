FactoryGirl.define do
  factory :block do
    sequence(:name) { |i| "block #{i}" }
  end
end
