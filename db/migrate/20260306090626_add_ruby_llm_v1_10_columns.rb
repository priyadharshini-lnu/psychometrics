# frozen_string_literal: true

class AddRubyLlmV110Columns < ActiveRecord::Migration[8.0]
  def change
    # Columns for upgrading to v1.9
    unless column_exists?(:ai_assistant_requests, :cached_tokens)
      add_column :ai_assistant_requests, :cached_tokens, :integer
    end

    unless column_exists?(:ai_assistant_requests, :cache_creation_tokens)
      add_column :ai_assistant_requests, :cache_creation_tokens, :integer
    end

    # Columns for upgrading to v1.10
    unless column_exists?(:ai_assistant_requests, :content_raw)
      add_column :ai_assistant_requests, :content_raw, :json
    end

    unless column_exists?(:ai_assistant_requests, :thinking_text)
      add_column :ai_assistant_requests, :thinking_text, :text
    end

    unless column_exists?(:ai_assistant_requests, :thinking_signature)
      add_column :ai_assistant_requests, :thinking_signature, :text
    end

    unless column_exists?(:ai_assistant_requests, :thinking_tokens)
      add_column :ai_assistant_requests, :thinking_tokens, :integer
    end

    unless column_exists?(:ai_assistant_tool_calls, :thought_signature)
      add_column :ai_assistant_tool_calls, :thought_signature, :string
    end
  end
end
