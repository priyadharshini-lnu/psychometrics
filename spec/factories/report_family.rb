FactoryGirl.define do
  factory :report_family do
    sequence(:name) { |i| "report family #{i}" }
  end
end
