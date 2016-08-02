class CreateMemberships < ActiveRecord::Migration[5.0]
  def change
    create_table :memberships do |t|
      t.references :client
      t.references :user
    end
    add_index :memberships, [:client_id, :user_id], unique: true
    add_foreign_key :memberships, :clients, on_delete: :cascade
    add_foreign_key :memberships, :users, on_delete: :cascade
  end
end
