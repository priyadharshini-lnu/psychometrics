# frozen_string_literal: true

FactoryBot.define do
  factory :campaign_option, class: 'CampaignOptions' do
    campaign { nil }
    timezone { 'MyString' }
    fixed_time { false }
    fixed_time_duration { 1 }
    instructions { 'MyText' }
  end
end
