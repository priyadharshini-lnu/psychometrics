# frozen_string_literal: true

class CreateCommunicationTemplates < ActiveRecord::Migration[7.1]
  def change
    create_table :communication_templates do |t|
      t.string  :name, null: false
      t.integer :kind, null: false
      t.integer :level, null: false
      t.integer :status, null: false, default: 0
      t.integer :recipients_default
      t.jsonb   :delivery_defaults

      t.references :client, foreign_key: true
      t.references :project, foreign_key: { to_table: :clients }
      t.references :campaign, foreign_key: true
      t.references :inherits_from_template, foreign_key: { to_table: :communication_templates }
      t.references :created_by, null: false, foreign_key: { to_table: :users }
      t.references :updated_by, null: false, foreign_key: { to_table: :users }

      t.bigint :tenant_id
      t.timestamps
    end

    add_index :communication_templates, :tenant_id
    add_index :communication_templates, %i[level status]
  end
end
