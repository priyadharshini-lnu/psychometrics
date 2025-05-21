# frozen_string_literal: true

class DropAIModels < ActiveRecord::Migration[7.1]
  def up
    remove_reference :ai_assistant_requests, :ai_assistant_usage, foreign_key: true, if_exists: true
    drop_table :ai_assistant_configs, if_exists: true
    drop_table :ai_assistant_prompts, if_exists: true
    drop_table :ai_assistant_usages, if_exists: true
  end
end
