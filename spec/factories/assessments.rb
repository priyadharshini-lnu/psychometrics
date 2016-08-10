FactoryGirl.define do
  factory :assessment do
    sequence(:name) { |i| "assessment #{i}" }
  end
end
