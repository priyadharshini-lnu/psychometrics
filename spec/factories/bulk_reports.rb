# frozen_string_literal: true

FactoryBot.define do
  factory :bulk_report do
    user

    trait :with_attached_file do
      files { [Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/archives/archive.zip'))] }
    end
  end
end
