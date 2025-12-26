# frozen_string_literal: true

class AddEnhanceWithAIToClientAndProjectFeatures < ActiveRecord::Migration[8.0]
  def change
    add_column :client_features, :enhance_with_ai, :boolean, default: false, null: false
    add_column :project_features, :enhance_with_ai, :boolean, default: false, null: false
  end
end
