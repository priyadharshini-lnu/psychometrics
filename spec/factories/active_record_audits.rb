# frozen_string_literal: true

FactoryBot.define do
  factory :active_record_audit do
    action { 'create' }
    user
    auditable_id { create(:dimension).id }
    auditable_type { 'Dimension' }
    audited_changes { {} }
    version { 1 }
    request_uuid { SecureRandom.uuid }
  end
end
