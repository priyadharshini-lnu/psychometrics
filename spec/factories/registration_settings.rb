# frozen_string_literal: true

FactoryBot.define do
  factory :registration_setting do
    require_mobile_number { false }
  end
end
