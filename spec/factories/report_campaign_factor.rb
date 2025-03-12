# frozen_string_literal: true

FactoryBot.define do
  factory :report_campaign_factor, class: 'Reports::CampaignFactor' do
    code { SecureRandom.hex(10) }
    name { Faker::Name.unique.name }
    output_type { 'numeric' }
    report
  end
end
