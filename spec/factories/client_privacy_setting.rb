# frozen_string_literal: true

FactoryBot.define do
  factory :client_privacy_setting do
    client factory: :tenancy
    disable_data_processing { false }
  end
end
