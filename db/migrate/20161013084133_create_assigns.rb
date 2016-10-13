class CreateAssigns < ActiveRecord::Migration[5.0]
  def change
    create_table :assigns do |t|
      t.references :assessment, index: false
      t.references :user, index: false
      t.references :client, index: false
      t.jsonb :results
      t.jsonb :scoring
      t.jsonb :embedded_data
      t.integer :status, default: 0 # ENUM
      t.integer :role, default: 0 # ENUM
      t.datetime :completed_at
      t.timestamps
    end
    add_index :assigns, [:client_id, :assessment_id, :user_id], unique: true
  end
end
