# frozen_string_literal: true

class AI::AssistantRequest < ApplicationRecord
  include ActiveStorageAttachable

  self.table_name = 'ai_assistant_requests'
  acts_as_message(
    chat: :ai_assistant_chat,
    chat_class: 'AI::AssistantChat',
    tool_calls: :tool_calls,
    tool_call_class: 'AI::AssistantToolCall',
    model: :ai_model_registry,
    model_class: 'AI::ModelRegistry'
  )

  after_commit :update_session_token_usage, if: -> { saved_change_to_input_tokens? || saved_change_to_output_tokens? }

  has_many_attachments :attachments,
                       service: Settings.storage.private_storage_service,
                       content_type: %w[application/pdf]

  belongs_to :parent_tool_call,
             class_name: 'AI::AssistantToolCall',
             foreign_key: 'ai_assistant_tool_call_id',
             optional: true

  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :ai_assistant_chat

  has_many :tool_calls,
           class_name: 'AI::AssistantToolCall',
           foreign_key: 'ai_assistant_request_id',
           dependent: :destroy

  has_many :tool_results,
           through: :tool_calls,
           source: :result,
           class_name: 'AI::AssistantRequest'

  enum :request_status, {
    success: 0,
    invalid: 1,
    failed: 2,
    correction: 3
  }, prefix: true

  def mark_invalid!(error_message, error: nil)
    update!(request_status: :invalid, meta: append_error_to_meta(error_message, 'invalid', error))
  end

  def mark_failed!(error_message, error: nil)
    update!(request_status: :failed, meta: append_error_to_meta(error_message, 'failed', error))
  end

  def error_history
    meta&.dig('error_history') || []
  end

  def last_error_message
    error_history.last&.dig('message')
  end

  # Override content getter to return content_raw if content is not present, for backward compatibility
  def content
    return self[:content] if self[:content].present?

    content_raw.is_a?(Hash) ? content_raw.to_json : content_raw
  end

  private

  def append_error_to_meta(error_message, error_type, error = nil)
    current_meta = meta || {}
    current_history = current_meta['error_history'] || []

    error_entry = {
      'message' => error_message,
      'type' => error_type,
      'timestamp' => Time.current.iso8601
    }
    error_entry['error'] = error.inspect if error.present?
    updated_history = current_history + [error_entry]

    current_meta.merge('error_history' => updated_history)
  end

  def attachment_storage_path(attribute_name, filename)
    "private/ai_assistants/#{chat.ai_assistant_id}/ai_assistant_chats/#{ai_assistant_chat_id}/" \
      "ai_assistant_requests/#{id}/#{attribute_name}/#{filename}"
  end

  def update_session_token_usage
    AI::AssistantChat.update_counters(
      ai_assistant_chat.id,
      input_tokens: input_tokens.to_i,
      output_tokens: output_tokens.to_i
    )
  end
end
