# frozen_string_literal: true

class CreateCampaignAIArtifactDependencies < ActiveRecord::Migration[7.1]
  def change
    create_table :campaign_ai_artifact_dependencies do |t|
      t.references :campaign_ai_artifact, null: false, foreign_key: { on_delete: :cascade }
      t.references :dependency, null: false, polymorphic: true, index: true
      t.jsonb :meta, default: {}

      t.timestamps
    end

    add_index :campaign_ai_artifact_dependencies, %i[campaign_ai_artifact_id dependency_type dependency_id],
              unique: true, name: 'index_unique_dependency_per_artifact'
  end
end
