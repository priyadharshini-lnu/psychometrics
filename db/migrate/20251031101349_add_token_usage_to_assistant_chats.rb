# frozen_string_literal: true

class AddTokenUsageToAssistantChats < ActiveRecord::Migration[8.0]
  def change
    change_table :ai_assistant_chats, bulk: true do |t|
      t.integer :input_tokens, default: 0
      t.integer :output_tokens, default: 0
    end
  end
end
