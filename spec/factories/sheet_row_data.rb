# frozen_string_literal: true

FactoryBot.define do
  factory :sheet_row_datum do
    sheet_row_id { 1 }
    sheet_column_id { 1 }
    string_value { nil }
    numeric_value { nil }
  end
end
