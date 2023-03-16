# frozen_string_literal: true

FactoryBot.define do
  factory :user_profile do
    age { 1 }
    age_updated_at { '2022-08-22 23:25:12' }
    gender { 1 }
    timezone { 'MyString' }
    photo { Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/profile.png')) }
    locale { 'MyString' }
  end
end
