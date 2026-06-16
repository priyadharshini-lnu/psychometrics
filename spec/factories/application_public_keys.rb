# frozen_string_literal: true

FactoryBot.define do
  factory :application_public_key do
    association :user, factory: :application_user
    public_key { OpenSSL::PKey::RSA.generate(2048).public_key.to_pem }
    description { 'Test key' }
    disabled { false }
  end
end
