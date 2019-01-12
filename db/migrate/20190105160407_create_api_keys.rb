class CreateApiKeys < ActiveRecord::Migration[5.1]
  def change
    create_table :api_keys do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.boolean :active
      t.string :token

      t.timestamps
    end

    add_index :api_keys, [:token], unique: true
  end
end

