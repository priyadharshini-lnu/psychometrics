# frozen_string_literal: true

class AddPromptToAssistant < ActiveRecord::Migration[7.1]
  def change
    # rubocop:disable Rails/BulkChangeTable
    add_column :ai_assistants, :user_prompt, :text
    add_column :ai_assistants, :system_prompt, :text
    add_reference :ai_assistants, :owner, null: true, foreign_key: { to_table: :clients }
    add_reference :ai_assistants, :last_modified_by, foreign_key: { to_table: :users }
    # rubocop:enable Rails/BulkChangeTable
  end
end
