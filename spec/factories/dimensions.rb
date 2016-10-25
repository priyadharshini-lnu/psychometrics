FactoryGirl.define do
  factory :dimension do
    sequence(:name) { |i| "dimension #{i}" }
  end
end
