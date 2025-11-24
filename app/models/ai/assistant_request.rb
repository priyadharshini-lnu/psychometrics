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

  has_many :tool_calls,
           class_name: 'AI::AssistantToolCall',
           foreign_key: 'ai_assistant_request_id',
           dependent: :destroy

  has_many :tool_results,
           through: :tool_calls,
           source: :result,
           class_name: 'AI::AssistantRequest'

  private

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
