# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_factor do
    campaign_factor_group
    position { 1 }
    name { Faker::Lorem.word }
    code { Faker::Lorem.words(number: 3).join('_').underscore }
    description { Faker::Lorem.sentence }
    factor_type { 'formula' }
    output_type { :numeric }
    campaign
    factor { nil }
    assessment { nil }
    sheet_column_name { 'MyString' }
    public_visibility { true }
  end
end
