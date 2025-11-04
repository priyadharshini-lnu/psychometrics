# frozen_string_literal: true

FactoryBot.define do
  factory :lti_oauth2_access_token, class: 'Lti::Oauth2AccessToken' do
    association :project, factory: :project
    token_hash { Digest::SHA256.hexdigest(SecureRandom.hex(32)) }
    scope { 'https://purl.imsglobal.org/spec/lti-ags/scope/score' }
    expires_at { 1.hour.from_now }
    integration_id { 'test_integration' }
    revoked { false }
    last_used_at { nil }
  end
end
