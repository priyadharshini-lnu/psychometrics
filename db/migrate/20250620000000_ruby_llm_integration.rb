# frozen_string_literal: true

class RubyLlmIntegration < ActiveRecord::Migration[7.1]
  def up
    add_ai_assistants_columns
    create_ai_assistant_chats_table
    create_ai_assistant_tool_calls_table
    add_ai_assistant_requests_columns
    add_tool_call_reference
    cleanup_old_columns

    remove_column :ai_assistant_requests, :total_tokens if column_exists?(:ai_assistant_requests, :total_tokens)

    change_column_default :ai_assistant_requests, :input_tokens, 0 if column_exists?(:ai_assistant_requests,
                                                                                     :input_tokens)
    change_column_default :ai_assistant_requests, :output_tokens, 0 if column_exists?(:ai_assistant_requests,
                                                                                      :output_tokens)
  end

  # rubocop:disable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
  def down
    add_column :ai_assistant_requests, :total_tokens, :integer unless column_exists?(:ai_assistant_requests,
                                                                                     :total_tokens)

    change_column_default :ai_assistant_requests, :input_tokens, nil if column_exists?(:ai_assistant_requests,
                                                                                       :input_tokens)
    change_column_default :ai_assistant_requests, :output_tokens, nil if column_exists?(:ai_assistant_requests,
                                                                                        :output_tokens)

    remove_column :ai_assistants, :model_id if column_exists?(:ai_assistants, :model_id)
    remove_column :ai_assistant_requests, :ai_assistant_id if column_exists?(:ai_assistant_requests, :ai_assistant_id)
    remove_column :ai_assistant_requests, :role if column_exists?(:ai_assistant_requests, :role)
    remove_column :ai_assistant_requests, :ai_assistant_tool_call_id if column_exists?(:ai_assistant_requests,
                                                                                       :ai_assistant_tool_call_id)
    remove_column :ai_assistant_requests, :ai_assistant_chat_id if column_exists?(:ai_assistant_requests,
                                                                                  :ai_assistant_chat_id)
    remove_column :ai_assistant_requests, :user_id if column_exists?(:ai_assistant_requests, :user_id)
    drop_table :ai_assistant_chats if table_exists?(:ai_assistant_chats)
    drop_table :ai_assistant_tool_calls if table_exists?(:ai_assistant_tool_calls)
  end
  # rubocop:enable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity

  private

  def add_ai_assistants_columns
    add_column :ai_assistants, :model_id, :string unless column_exists?(:ai_assistants, :model_id)
  end

  def add_ai_assistant_requests_columns
    add_column :ai_assistant_requests, :role, :string unless column_exists?(:ai_assistant_requests, :role)
    add_column :ai_assistant_requests, :content, :text unless column_exists?(:ai_assistant_requests, :content)
    add_column :ai_assistant_requests, :model_id, :string unless column_exists?(:ai_assistant_requests, :model_id)

    add_reference :ai_assistant_requests, :ai_assistant, null: true, foreign_key: true unless column_exists?(
      :ai_assistant_requests, :ai_assistant_id
    )
    unless column_exists?(
      :ai_assistant_requests, :ai_assistant_chat_id
    )
      # We won't have any record for this table till now, hence this should be fine
      # rubocop:disable Rails/NotNullColumn
      add_reference :ai_assistant_requests, :ai_assistant_chat, null: false
      # rubocop:enable Rails/NotNullColumn
    end
  end

  def create_ai_assistant_tool_calls_table
    return if table_exists?(:ai_assistant_tool_calls)

    create_table :ai_assistant_tool_calls do |t|
      t.references :ai_assistant_request, null: false
      t.string :tool_call_id, null: false, index: { unique: true } # Provider's ID for the call
      t.string :name, null: false
      t.jsonb :arguments, default: {}

      t.timestamps
    end
  end

  def add_tool_call_reference
    return if column_exists?(:ai_assistant_requests, :ai_assistant_tool_call_id)

    add_reference :ai_assistant_requests, :ai_assistant_tool_call, null: true
  end

  def cleanup_old_columns
    return unless column_exists?(:ai_assistants, :provider_id)

    remove_column :ai_assistants, :provider_id, :string
  end

  def create_ai_assistant_chats_table
    return if table_exists?(:ai_assistant_chats)

    create_table :ai_assistant_chats do |t|
      t.string :model_id
      t.references :ai_assistant, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.references :client, null: true, foreign_key: true

      t.timestamps
    end
  end
end
