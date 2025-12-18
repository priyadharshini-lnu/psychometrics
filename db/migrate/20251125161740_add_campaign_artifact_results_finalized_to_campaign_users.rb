# frozen_string_literal: true

class AddCampaignArtifactResultsFinalizedToCampaignUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :campaign_users, :campaign_artifact_results_finalized, :boolean, default: false
  end
end
