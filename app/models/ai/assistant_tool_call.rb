# frozen_string_literal: true

class AI::AssistantToolCall < ApplicationRecord
  self.table_name = 'ai_assistant_tool_calls'
  acts_as_tool_call(
    message: :ai_assistant_request,
    message_class: 'AI::AssistantRequest'
  )

  belongs_to :ai_assistant_request,
             class_name: 'AI::AssistantRequest'
  include Tenantable

  tenant_source :ai_assistant_request

  has_one :result,
          class_name: 'AI::AssistantRequest',
          foreign_key: 'ai_assistant_tool_call_id',
          dependent: :nullify
end
