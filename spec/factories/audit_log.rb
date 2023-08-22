# frozen_string_literal: true

FactoryBot.define do
  factory :audit_log, class: AuditLog do
    client
  end
end
