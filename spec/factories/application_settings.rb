# frozen_string_literal: true

FactoryBot.define do
  factory :application_setting do
    association :application, factory: :application_user
    ip_whitelisting_enabled { false }

    transient do
      tenant { application.tenant }
    end

    tenant_id { tenant.id }
  end
end
