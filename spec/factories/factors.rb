FactoryGirl.define do
  factory :factor do
    sequence(:name) { |i| "factor #{i}" }
    dimension
  end
end
