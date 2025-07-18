# frozen_string_literal: true

# rubocop:disable Naming/VariableNumber
class DeprecateDatasheetAndProfileJsonFields < ActiveRecord::Migration[7.1]
  def change
    rename_column :sheets, :columns, :columns_deprecated_on_11_07_2025
    rename_column :sheet_rows, :data, :data_deprecated_on_11_07_2025
    rename_column :user_profiles, :custom_fields, :custom_fields_deprecated_on_11_07_2025
  end
end
# rubocop:enable Naming/VariableNumber
