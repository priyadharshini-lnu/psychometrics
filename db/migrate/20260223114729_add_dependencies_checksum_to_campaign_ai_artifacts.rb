# frozen_string_literal: true

class AddDependenciesChecksumToCampaignAIArtifacts < ActiveRecord::Migration[8.0]
  def change
    add_column :campaign_ai_artifacts, :dependencies_checksum, :string
  end
end
