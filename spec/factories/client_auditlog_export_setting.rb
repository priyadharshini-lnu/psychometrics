# frozen_string_literal: true

FactoryBot.define do
  factory :client_auditlog_export_setting do
    client { build(:tenancy) }
  end
end
