# frozen_string_literal: true

FactoryBot.define do
  factory :session do
    sequence(:session_id) { |n| SecureRandom.hex(16) + n.to_s }
    data { {} }
    association :user, factory: :superadmin
    association :client, factory: :tenancy
    impersonator { nil }
    subdomain { client&.subdomain }
  end
end
