# frozen_string_literal: true

FactoryBot.define do
  factory :user_report_pdf do
    user_report
    locale { 'en' }

    trait :with_pdf do
      after(:create) do |user_report_pdf|
        user_report_pdf.pdf_file.attach(
          io: Rails.root.join('spec/fixtures/files/reports/test.pdf').open,
          filename: 'test.pdf',
          content_type: 'application/pdf'
        )
      end
    end
  end
end
