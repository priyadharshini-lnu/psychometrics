# frozen_string_literal: true

class AI::AssistantChat < ApplicationRecord
  self.table_name = 'ai_assistant_chats'

  acts_as_chat(
    message_class: 'AI::AssistantRequest',
    tool_call_class: 'AI::AssistantToolCall'
  )

  validates :model_id, presence: true

  belongs_to :ai_assistant, class_name: 'AI::Assistant'
  belongs_to :user, class_name: 'User'
  has_many :messages,
           -> { order(created_at: :asc) },
           class_name: 'AI::AssistantRequest', foreign_key: 'ai_assistant_chat_id', dependent: :destroy
end
