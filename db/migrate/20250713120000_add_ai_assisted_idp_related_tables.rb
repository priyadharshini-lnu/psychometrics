# frozen_string_literal: true

class AddAIAssistedIdpRelatedTables < ActiveRecord::Migration[7.1]
  def change
    change_table :idp_templates, bulk: true do |t|
      t.boolean :ai_enabled, default: false, null: false
      t.boolean :ai_assisted_idp_enabled, default: false, null: false
      t.references :ai_assistant, foreign_key: { to_table: :ai_assistants, on_delete: :nullify }
      t.boolean :one_click_idp_enabled, default: false, null: false
      t.references :one_click_ai_assistant, foreign_key: { to_table: :ai_assistants, on_delete: :nullify }
    end
  end
end
