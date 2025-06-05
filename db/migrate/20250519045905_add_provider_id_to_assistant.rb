# frozen_string_literal: true

class AddProviderIdToAssistant < ActiveRecord::Migration[7.1]
  def change
    # rubocop:disable Rails/NotNullColumn
    add_column :ai_assistants, :provider_id, :string, null: false
    # rubocop:enable Rails/NotNullColumn
  end
end
