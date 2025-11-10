# frozen_string_literal: true

class RemoveAIAssistantChatIdFromAIAssistedUserSessions < ActiveRecord::Migration[8.0]
  def change
    remove_column :ai_assisted_user_sessions, :ai_assistant_chat_id, :bigint
  end
end
