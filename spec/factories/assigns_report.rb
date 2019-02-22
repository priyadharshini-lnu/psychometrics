FactoryGirl.define do
  factory :assigns_report do
    assign
    report


    trait :licensed do
      after(:build) do |assigns_report|
        allow(assigns_report).to receive(:use_license).and_return(true)
      end
    end
  end
end
