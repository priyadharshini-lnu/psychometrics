class CreateSheetRowData < ActiveRecord::Migration[7.1]
  def change
    create_table :sheet_row_data do |t|
      t.text :string_value
      t.float :numeric_value
      t.references :sheet_row, null: false, foreign_key: { on_delete: :cascade }, index: true
      t.references :sheet_column, null: false, foreign_key: { on_delete: :cascade }, index: false

      t.timestamps
    end
  end
end
