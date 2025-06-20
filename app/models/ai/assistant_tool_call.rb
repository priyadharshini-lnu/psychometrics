# frozen_string_literal: true

class AI::AssistantToolCall < ApplicationRecord
  self.table_name = 'ai_assistant_tool_calls'

  acts_as_tool_call(message_class: 'AI::AssistantRequest', message_foreign_key: 'ai_assistant_request_id')
end
