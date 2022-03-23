# frozen_string_literal: true

class CreateIntegrations < ActiveRecord::Migration[5.2]
  def change
    create_table :integrations do |t|
      t.integer :name, null: false, default: 0
      t.boolean :active, default: true
      t.jsonb :config, default: {}

      t.timestamps
    end

    add_reference :integrations, :project, foreign_key: { on_delete: :cascade, to_table: :clients }, null: false
  end
end
