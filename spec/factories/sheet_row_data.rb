# frozen_string_literal: true

FactoryBot.define do
  factory :sheet_row_datum do
    sheet_row_id { 1 }
    sheet_column_id { 1 }
    string_value { 'MyText' }
    numeric_value { 1.5 }
  end
end
