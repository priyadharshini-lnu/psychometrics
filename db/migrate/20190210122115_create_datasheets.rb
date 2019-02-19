class CreateDatasheets < ActiveRecord::Migration[5.1]
  def change
    create_table :datasheets do |t|
      t.belongs_to :project, foreign_key: { to_table: :clients, on_delete: :cascade }
      t.string :filename
      t.jsonb :columns

      t.timestamps
    end
  end
end
