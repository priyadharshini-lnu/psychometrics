# frozen_string_literal: true

FactoryBot.define do
  factory :saml_service_provider do
    name { 'Test Service Provider' }
    entity_id { 'http://localhost:3000/users/saml/metadata' }
    acs_urls { ['http://localhost:3000/users/saml/auth'] }
    enabled { true }
    require_signed_requests { false }
    association :project
  end
end
