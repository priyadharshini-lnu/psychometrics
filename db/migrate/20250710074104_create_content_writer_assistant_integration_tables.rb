# frozen_string_literal: true

class CreateContentWriterAssistantIntegrationTables < ActiveRecord::Migration[7.1]
  def change
    create_table :campaign_ai_artifacts do |t|
      t.references :ai_assistant, null: false, foreign_key: { to_table: :ai_assistants }
      t.string :code, null: false
      t.string :name, null: false
      t.references :campaign, null: false, foreign_key: true
      t.jsonb :assessments, null: false, default: []
      t.jsonb :campaign_factors, null: false, default: []
      t.jsonb :datasheet_columns, null: false, default: []
      t.boolean :include_all_datasheet_columns, default: false
      t.text :instructions

      t.timestamps
    end

    add_index :campaign_ai_artifacts, %i[campaign_id code], unique: true

    create_table :campaign_ai_artifact_results do |t|
      t.references :user, null: false, foreign_key: true
      t.references :campaign_ai_artifact, null: false, foreign_key: true
      t.text :error, null: true, default: nil
      t.jsonb :results, null: false, default: {}
      t.timestamps
    end

    add_index :campaign_ai_artifact_results, %i[campaign_ai_artifact_id user_id], unique: true

    create_table :reports_campaign_ai_artifacts do |t|
      t.string :code, null: false
      t.references :report, null: false, foreign_key: { on_delete: :cascade }
      t.string :name, null: false
      t.references :ai_assistant, null: false, foreign_key: { to_table: :ai_assistants }

      t.timestamps
    end

    add_index :reports_campaign_ai_artifacts, %i[report_id code], unique: true
  end
end
