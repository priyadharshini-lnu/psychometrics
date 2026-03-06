# frozen_string_literal: true

class AddResourceToAIAssistedUserSessions < ActiveRecord::Migration[8.0]
  def change
    add_reference :ai_assisted_user_sessions, :resource, polymorphic: true, index: true
  end
end
