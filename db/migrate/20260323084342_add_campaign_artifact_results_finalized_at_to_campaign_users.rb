# frozen_string_literal: true

class AddCampaignArtifactResultsFinalizedAtToCampaignUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :campaign_users, :campaign_artifact_results_finalized_at, :datetime
  end
end
