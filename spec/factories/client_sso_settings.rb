# frozen_string_literal: true

FactoryBot.define do
  factory :client_sso_setting do
    association :client, factory: :tenancy
    sso_enabled { false }
    sso_enforced { false }
    idp_entity_id { nil }
    idp_sso_url { nil }
    idp_slo_url { nil }
    idp_cert { nil }
    session_timeout { nil }
    allowed_domains { [] }

    trait :enabled do
      sso_enabled { true }
      idp_entity_id { "https://idp.example.com/#{SecureRandom.hex(4)}" }
      idp_sso_url { 'https://idp.example.com/sso/saml' }
      idp_slo_url { 'https://idp.example.com/sso/slo' }
      idp_cert { Rails.root.join('spec/fixtures/files/cert.pem').read }
    end

    trait :enforced do
      enabled
      sso_enforced { true }
    end
  end
end
