# frozen_string_literal: true

class CreateAIAssistantOutputSchemaKeys < ActiveRecord::Migration[7.1]
  def change
    create_table :ai_assistant_output_schema_keys do |t|
      t.references :ai_assistant, null: false, foreign_key: { to_table: :ai_assistants }
      t.string :key, null: false
      t.integer :key_type, null: false, default: 0
      t.text :description

      t.timestamps
    end

    add_index :ai_assistant_output_schema_keys, %i[ai_assistant_id key], unique: true
  end
end
