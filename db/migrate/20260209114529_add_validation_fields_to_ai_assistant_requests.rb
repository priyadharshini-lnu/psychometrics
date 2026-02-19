# frozen_string_literal: true

class AddValidationFieldsToAIAssistantRequests < ActiveRecord::Migration[8.0]
  def change
    change_table :ai_assistant_requests, bulk: true do |t|
      t.integer :request_status, null: false, default: 0
      t.jsonb :meta
    end
  end
end
