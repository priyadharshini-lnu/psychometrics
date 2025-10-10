# frozen_string_literal: true

class CreateProjectFeatures < ActiveRecord::Migration[7.1]
  def change
    create_table :project_features do |t|
      t.integer :project_id
      t.boolean :sms_notification, null: false, default: false
      t.boolean :ai_assistants, null: false, default: false
      t.boolean :ai_assisted_idp, null: false, default: false
      t.boolean :global_skills, null: false, default: false
      t.boolean :idp, null: false, default: false

      t.timestamps
    end

    add_index :project_features, :project_id, unique: true
    add_foreign_key :project_features, :clients, column: :project_id, foreign_key: { on_delete: :cascade }
  end
end
