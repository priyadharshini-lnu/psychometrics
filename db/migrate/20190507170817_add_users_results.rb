class AddUsersResults < ActiveRecord::Migration[5.1]
  def change
    create_table :users_results do |t|
      t.belongs_to :subject, foreign_key: { to_table: :users, on_delete: :restrict }
      t.belongs_to :evaluator, foreign_key: { to_table: :users, on_delete: :restrict }
      t.belongs_to :assessment, foreign_key: { on_delete: :restrict }
      t.jsonb :answers
      t.jsonb :scoring
      t.jsonb :occupations
      t.jsonb :embedded_data
      t.jsonb :norm_data
      t.integer :step, default: 0
      t.integer :status, default: 0
      t.datetime :completed_at
      t.timestamps
    end
  end
end
