# frozen_string_literal: true

FactoryBot.define do
  factory :user_report do
    user
    campaign
    report

    trait :with_pdf do
      pdf { Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/reports/test.pdf'), 'application/pdf') }
    end
  end
end
