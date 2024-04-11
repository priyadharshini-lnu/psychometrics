# frozen_string_literal: true

FactoryBot.define do
  factory :library do
    name { Faker::Lorem.word }

    trait :image do
      type { 'image' }

      file { Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/images/test_image.jpeg'), 'image/jpeg') }
    end
  end
end
