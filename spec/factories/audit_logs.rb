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

    trait :with_active_record_audits do
      after(:create) do |audit_log|
        create(:active_record_audit, auditable_id: audit_log.record_id,
        audited_changes: audit_log.record.attributes,
        auditable_type: audit_log.record_type,
        request_uuid: audit_log.request_uuid, action: 'create')
      end
    end
  end
end
