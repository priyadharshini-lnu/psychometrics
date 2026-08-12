# frozen_string_literal: true

FactoryBot.define do
  factory :saml_setting do
    enabled { false }
    enforced { false }
    enforce_for { 'none' }
    association :project
    entity_id { Faker::Lorem.characters(number: 5) }
    sso_service_url { Faker::Internet.url }
    after_signout_url { Faker::Internet.url }
    cert { Rails.root.join('spec/fixtures/files/cert.pem').read }
    name_identifier_format { 'email' }
    email_pipetext { '' }
  end
end
