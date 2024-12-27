# frozen_string_literal: true

namespace :one_time do
  task populate_datasheet_email_column: :environment do
    Sheet.find_each do |sheet|
      column = sheet.sheet_columns.find_by(name: Sheet::EMAIL_COLUMN)
      column ||= sheet.sheet_columns.create!(name: Sheet::EMAIL_COLUMN, column_type: 'string', position: 0,
                                             visible_in_list: true, dashboard_use: true, accessor_access: true)

      sheet.rows.find_each do |row|
        row.sheet_row_data.find_or_create_by(sheet_column_id: column.id) do |row_data|
          row_data.string_value = row.email
        end
      end
    end
  end
end
