# frozen_string_literal: true

FactoryBot.define do
  factory :audit_log do
    action { 'create' }
    user
    record_id { create(:dimension).id }
    record_type { 'Dimension' }
    payload { {} }
    request { {} }
    request_uuid { SecureRandom.uuid }
    created_at { Time.zone.now }
    updated_at { Time.zone.now }
  end
end
