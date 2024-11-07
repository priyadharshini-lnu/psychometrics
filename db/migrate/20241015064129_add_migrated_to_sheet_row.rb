# frozen_string_literal: true

class AddMigratedToSheetRow < ActiveRecord::Migration[7.1]
  def change
    add_column :sheet_rows, :migrated, :boolean, default: false
  end
end
