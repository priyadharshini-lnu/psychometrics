# frozen_string_literal: true

FactoryBot.define do
  factory :user_preference do
    user
    category { 'theme' }
    config_key { "config_#{SecureRandom.hex(4)}" }
    payload { { 'some_setting' => 'value' } }
    name { 'My Preference' }

    trait :workspace do
      category { 'workspace' }
      payload { { 'layout' => 'grid', 'urls' => [] } }
    end

    trait :favorite do
      category { 'favorite' }
      resource { create(:project) } # Assuming project factory exists
    end
  end
end
