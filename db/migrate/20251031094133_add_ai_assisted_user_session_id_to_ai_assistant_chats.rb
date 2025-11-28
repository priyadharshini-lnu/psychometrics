# frozen_string_literal: true

class AddAIAssistedUserSessionIdToAIAssistantChats < ActiveRecord::Migration[8.0]
  def change
    add_reference :ai_assistant_chats,
                  :ai_assisted_user_session,
                  foreign_key: { to_table: :ai_assisted_user_sessions },
                  index: true

    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          UPDATE ai_assistant_chats
          SET ai_assisted_user_session_id = sessions.id
          FROM ai_assisted_user_sessions AS sessions
          WHERE sessions.ai_assistant_chat_id = ai_assistant_chats.id
          AND ai_assistant_chats.ai_assisted_user_session_id IS NULL;
        SQL
      end
    end
  end
end
