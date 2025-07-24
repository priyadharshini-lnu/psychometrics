# frozen_string_literal: true

class RemoveActionAndAddTypeStatusAndDependenciesToAIAssistants < ActiveRecord::Migration[7.1]
  def change
    # rubocop:disable Rails/BulkChangeTable
    remove_column :ai_assistants, :action, :string
    add_column :ai_assistants, :assistant_type, :integer, null: false, default: 0
    add_column :ai_assistants, :dependencies, :jsonb, null: false, default: []
    add_column :ai_assistants, :status, :integer, null: false, default: 0
    # rubocop:enable Rails/BulkChangeTable
  end
end
