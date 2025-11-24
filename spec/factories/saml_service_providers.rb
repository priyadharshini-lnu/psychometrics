# frozen_string_literal: true

FactoryBot.define do
  factory :saml_service_provider do
    sequence(:name) { |n| "Test Service Provider #{n}" }
    sequence(:entity_id) { |n| "http://localhost:3000/users/saml/metadata/#{n}" }
    acs_urls { ['http://localhost:3000/users/saml/auth'] }
    enabled { true }
    mask_identity { false }
    require_signed_requests { false }
    association :project
  end
end
