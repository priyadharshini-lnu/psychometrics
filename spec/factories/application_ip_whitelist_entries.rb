# frozen_string_literal: true

FactoryBot.define do
  factory :application_ip_whitelist_entry do
    association :application_setting
    ip_or_cidr { '192.168.1.1' }
    enabled { true }
    description { nil }

    tenant_id { application_setting.tenant_id }
  end
end
