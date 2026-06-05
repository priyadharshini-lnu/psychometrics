# frozen_string_literal: true

class AI::AssistantOutputSchemaKey < ApplicationRecord
  self.inheritance_column = :_type_disabled

  belongs_to :ai_assistant, class_name: 'AI::Assistant'

  include Tenantable

  tenant_source :ai_assistant

  enum :key_type, {
    string: 0,
    html: 1,
    markdown: 2
  }

  validates :key, presence: true, uniqueness: { scope: :ai_assistant_id }
end
