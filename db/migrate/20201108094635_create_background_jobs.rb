# frozen_string_literal: true

class CreateBackgroundJobs < ActiveRecord::Migration[5.1]
  def change
    create_table :admin_jobs do |t|
      t.references :owner, foreign_key: { on_delete: :cascade, to_table: :users }
      t.integer :operation, limit: 2
      t.float :progress, default: 0
      t.json :data, default: {}
      t.string :file
      t.integer :status, limit: 2, default: 0
      t.json :error_messages, default: []
      t.string :content
      t.boolean :read, default: false

      t.timestamps
    end
  end
end
