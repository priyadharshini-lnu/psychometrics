# frozen_string_literal: true

class FixAIAssistantChatsFkCascade < ActiveRecord::Migration[8.0]
  def change
    remove_foreign_key :ai_assistant_chats, :ai_assisted_user_sessions
    add_foreign_key :ai_assistant_chats, :ai_assisted_user_sessions, on_delete: :cascade
  end
end
