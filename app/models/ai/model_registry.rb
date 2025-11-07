# frozen_string_literal: true

class AI::ModelRegistry < ApplicationRecord
  self.table_name = 'ai_model_registries'
  acts_as_model chats: :ai_assistant_chats, chat_class: 'AI::AssistantChat'
end
