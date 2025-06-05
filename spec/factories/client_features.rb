# frozen_string_literal: true

FactoryBot.define do
  factory :client_feature do
    client { nil }
    sms_notification { false }
  end
end
