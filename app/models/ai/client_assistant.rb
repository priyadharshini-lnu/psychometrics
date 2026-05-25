# frozen_string_literal: true

class AI::ClientAssistant < ApplicationRecord
  self.table_name = 'client_ai_assistants'

  belongs_to :ai_assistant, class_name: 'AI::Assistant'

  include Tenantable

  tenant_source :ai_assistant
end
