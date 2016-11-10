class CreateCommunications < ActiveRecord::Migration[5.0]
  def change
    create_table :communications do |t|
      t.string :subject
      t.text :body
      t.references :assessment, index: true
      t.references :client, index: true
      t.integer :recipients, default: 0
      t.boolean :disabled, default: false
      t.integer :delivery_rule, default: 0
      t.datetime :delivery_at, default: nil
      t.string :delivery_interval, default: nil

      t.timestamps
    end
  end
end
