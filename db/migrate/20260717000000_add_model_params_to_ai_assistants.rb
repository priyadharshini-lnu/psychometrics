# frozen_string_literal: true

class AddModelParamsToAIAssistants < ActiveRecord::Migration[7.2]
  def change
    add_column :ai_assistants, :model_params, :jsonb, default: {}, null: false
  end
end
