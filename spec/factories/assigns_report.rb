FactoryGirl.define do
  factory :assigns_report do
    assign
    report


    trait :licensed do
      after(:build) do |assigns_report|
        allow(assigns_report).to receive(:use_license).and_return(true)
      end
    end
    trait :with_pdf do
       pdf { Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/reports/test.pdf'), 'application/pdf') }
    end
  end
end
