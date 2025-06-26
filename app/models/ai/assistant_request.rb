# frozen_string_literal: true

class AI::AssistantRequest < ApplicationRecord
  self.table_name = 'ai_assistant_requests'

  acts_as_message(
    chat_class: 'AI::AssistantChat',
    chat_foreign_key: 'ai_assistant_chat_id',
    tool_call_class: 'AI::AssistantToolCall',
    tool_call_foreign_key: 'ai_assistant_tool_call_id',
    touch_chat: false
  )

  has_many :tool_calls, class_name: 'AI::AssistantToolCall', foreign_key: 'ai_assistant_request_id', dependent: :destroy
end
