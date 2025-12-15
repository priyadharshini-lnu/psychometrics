# frozen_string_literal: true

class AddAdvancedPromptingEnabledToAIAssistant < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_assistants, :advanced_prompting_enabled, :boolean, default: false, null: false
  end
end
