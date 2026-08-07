# frozen_string_literal: true

FactoryBot.define do
  factory :application_url_whitelist_entry do
    association :application_setting
    url { 'https://example.com/callback' }
    enabled { true }
    description { nil }

    tenant_id { application_setting.tenant_id }
  end
end
