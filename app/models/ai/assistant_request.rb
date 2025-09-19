# frozen_string_literal: true

class AI::AssistantRequest < ApplicationRecord
  include ActiveStorageAttachable
  self.table_name = 'ai_assistant_requests'

  acts_as_message(
    chat_class: 'AI::AssistantChat',
    chat_foreign_key: 'ai_assistant_chat_id',
    tool_call_class: 'AI::AssistantToolCall',
    tool_call_foreign_key: 'ai_assistant_tool_call_id',
    touch_chat: false
  )

  has_many_attachments :attachments,
                       service: Settings.storage.private_storage_service,
                       content_type: %w[application/pdf]

  has_many :tool_calls, class_name: 'AI::AssistantToolCall', foreign_key: 'ai_assistant_request_id', dependent: :destroy

  private

  def attachment_storage_path(attribute_name, filename)
    "private/ai_assistants/#{chat.ai_assistant_id}/ai_assistant_chats/#{ai_assistant_chat_id}/" \
      "ai_assistant_requests/#{id}/#{attribute_name}/#{filename}"
  end
end
