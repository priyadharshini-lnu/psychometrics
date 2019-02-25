class CreateDatasheetRows < ActiveRecord::Migration[5.1]
  def change
    enable_extension('citext')
    create_table :datasheet_rows do |t|
      t.belongs_to :datasheet, foreign_key: { on_delete: :cascade }
      t.citext :email
      t.jsonb :data

      t.timestamps
    end
    add_index :datasheet_rows, %i[email datasheet_id], unique: true
  end
end
