# frozen_string_literal: true

class CreateAIAssistedUserSessions < ActiveRecord::Migration[7.1]
  def change
    create_table :ai_assisted_user_sessions do |t|
      t.references :ai_assistant_chat, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.references :assistable, polymorphic: true
      t.jsonb :checkpoint
      t.string :type
      t.text :error
      t.integer :status, default: 0, null: false
      t.jsonb :meta, default: {}
      t.string :content_checksum
      t.timestamps
    end

    add_index :ai_assisted_user_sessions, %i[assistable_type assistable_id type],
              name: 'index_ai_sessions_on_assistable_and_type'
    add_index :ai_assisted_user_sessions, %i[user_id type]
  end
end
