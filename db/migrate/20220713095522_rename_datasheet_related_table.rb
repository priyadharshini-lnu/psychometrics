# frozen_string_literal: true

class RenameDatasheetRelatedTable < ActiveRecord::Migration[5.2]
  def change
    rename_table :datasheets, :sheets
    rename_table :datasheet_rows, :sheet_rows
    rename_column :sheet_rows, :datasheet_id, :sheet_id
  end
end
