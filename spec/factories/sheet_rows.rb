# frozen_string_literal: true

FactoryBot.define do
  factory :sheet_row do
    sheet { nil }
    email { '' }
    data { {} }
  end
end
