# frozen_string_literal: true

class RemoveDependenciesColumnsFromCampaignAIArtifacts < ActiveRecord::Migration[7.1]
  def change
    # Bulk doesn't allow adding column types making t.remove (without type) is not reversible
    remove_column :campaign_ai_artifacts, :assessments, :jsonb, default: []
    remove_column :campaign_ai_artifacts, :datasheet_columns, :jsonb, default: []
    remove_column :campaign_ai_artifacts, :campaign_factors, :jsonb, default: []
  end
end
