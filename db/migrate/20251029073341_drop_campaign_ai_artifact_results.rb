# frozen_string_literal: true

class DropCampaignAIArtifactResults < ActiveRecord::Migration[8.0]
  def change
    drop_table :campaign_ai_artifact_results do |t|
      t.references :user, null: false, foreign_key: true
      t.references :campaign_ai_artifact, null: false, foreign_key: true
      t.text :error, null: true, default: nil
      t.jsonb :results, null: false, default: {}
      t.text :parsed_dependencies
      t.timestamps
    end
  end
end
