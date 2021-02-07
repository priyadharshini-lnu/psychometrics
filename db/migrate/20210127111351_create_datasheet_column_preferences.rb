# frozen_string_literal: true

class CreateDatasheetColumnPreferences < ActiveRecord::Migration[5.2]
  def change
    create_table :datasheet_column_preferences do |t|
      t.belongs_to :resource, polymorphic: true, index: { name: :datasheet_column_preference_resource }
      t.json :visible_columns

      t.timestamps
    end
  end
end
