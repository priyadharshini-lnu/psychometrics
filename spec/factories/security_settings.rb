# frozen_string_literal: true

FactoryBot.define do
  factory :security_setting do
    project_id { 1 }
    enforce_strong_password { false }
    min_password_length { 8 }
    enforce_password_policy { false }
    disable_password_reuse { false }
    password_expiration { 30 }
    restrict_sequences { false }
    lock_account { false }
    attempts_to_lock { 3 }
    auto_unlock_time { 15 }
    send_unlock_email { false }
  end
end
