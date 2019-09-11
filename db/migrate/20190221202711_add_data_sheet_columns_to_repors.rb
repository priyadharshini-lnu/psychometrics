# frozen_string_literal: true

class AddDataSheetColumnsToRepors < ActiveRecord::Migration[5.1]
  def change
    add_column :reports, :data_sheet_columns, :jsonb, null: false, default: []
  end
end
