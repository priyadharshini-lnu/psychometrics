# frozen_string_literal: true

FactoryBot.define do
  factory :sheet_column do
    column_type { :string }
    name { 'Col1' }
  end
end
