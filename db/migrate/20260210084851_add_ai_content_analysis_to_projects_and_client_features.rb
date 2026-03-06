# frozen_string_literal: true

class AddAIContentAnalysisToProjectsAndClientFeatures < ActiveRecord::Migration[8.0]
  def change
    add_column :client_features, :ai_content_analysis, :boolean, default: false, null: false
    add_column :project_features, :ai_content_analysis, :boolean, default: false, null: false
  end
end
