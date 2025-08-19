# frozen_string_literal: true

class AI::AssistantOutputSchemaKey < ApplicationRecord
  self.inheritance_column = :_type_disabled

  belongs_to :ai_assistant, class_name: 'AI::Assistant'

  enum :key_type, {
    string: 0
  }

  validates :key, presence: true, uniqueness: { scope: :ai_assistant_id }
end
