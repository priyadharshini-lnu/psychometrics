class CreateActivesupportTablesMigration < ActiveRecord::Migration[6.1]
  def change
    create_table :activesupport_tables_migrations do |t|
      t.string :table_name, null: false
      t.string :model_name, null: false
      t.integer :last_processed_id, null: false
    end

    add_index :activesupport_tables_migrations, :table_name, unique: true
    add_index :activesupport_tables_migrations, :model_name, unique: true
  end
end
