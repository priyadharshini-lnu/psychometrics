# frozen_string_literal: true

FactoryBot.define do
  factory :user_profile do
    age { 1 }
    age_updated_at { '2022-08-22 23:25:12' }
    gender { 1 }
    timezone { 'MyString' }
    locale { 'MyString' }

    after(:create) do |user_profile|
      user_profile.photo.attach(
        io: Rails.root.join('spec/fixtures/files/profile.png').open,
        filename: 'profile.png',
        content_type: 'image/png'
      )
    end
  end
end
