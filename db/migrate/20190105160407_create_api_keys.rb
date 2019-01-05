class CreateApiKeys < ActiveRecord::Migration[5.1]
  def change
    create_table :api_keys do |t|
      t.references :membership, null: false, foreign_key: { on_delete: :cascade }
      t.boolean :active
      t.string :token

      t.timestamps
    end
  end
end

