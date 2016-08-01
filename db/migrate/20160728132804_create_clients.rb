class CreateClients < ActiveRecord::Migration[5.0]
  def change
    create_table :clients do |t|
      t.string :name
      t.integer :licenses, default: 0
      t.integer :licenses_used, default: 0
      t.date  :licenses_expire
      t.string  :subdomain
      t.attachment :logo
      t.json :design
      t.boolean :disabled, default: false
      t.timestamps
    end
    add_index :clients, :subdomain, unique: true
  end
end
