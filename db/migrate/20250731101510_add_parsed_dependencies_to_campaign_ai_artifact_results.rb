# frozen_string_literal: true

class AddParsedDependenciesToCampaignAIArtifactResults < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_ai_artifact_results, :parsed_dependencies, :text
  end
end
