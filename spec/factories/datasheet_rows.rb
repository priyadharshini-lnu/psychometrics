# frozen_string_literal: true

FactoryBot.define do
  factory :datasheet_row do
    datasheet { nil }
    email { '' }
    data { '' }
  end
end
