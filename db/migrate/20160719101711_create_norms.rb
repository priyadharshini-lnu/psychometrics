class CreateNorms < ActiveRecord::Migration[5.0]
  def change
    create_table :norms do |t|
      t.string :name
      t.boolean :disabled, default: false
      t.integer :created_by, null: true
      t.integer :updated_by, null: true

      t.timestamps
    end
    add_foreign_key :norms, :users, column: :created_by
    add_foreign_key :norms, :users, column: :updated_by
  end
end
