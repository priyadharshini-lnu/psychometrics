# frozen_string_literal: true

# NOTE: The migration has been modified to deal with dropping the table after it was merged to the platform lh-develop

class DropCampaignAIArtifactResults < ActiveRecord::Migration[8.0]
  def up
    migrate_campaign_artifact_results_data

    drop_table :campaign_ai_artifact_results
  end

  def down
    create_table :campaign_ai_artifact_results do |t|
      t.references :user, null: false, foreign_key: true
      t.references :campaign_ai_artifact, null: false, foreign_key: true
      t.text :error, null: true, default: nil
      t.jsonb :results, null: false, default: {}
      t.text :parsed_dependencies
      t.timestamps
    end

    migrate_data_back_to_campaign_artifact_results
  end

  private

  def migrate_campaign_artifact_results_data
    return unless table_exists?(:campaign_ai_artifact_results)

    records_to_migrate = execute(<<-SQL.squish)
      SELECT
        car.user_id,
        car.campaign_ai_artifact_id,
        car.error,
        car.results,
        car.parsed_dependencies,
        car.created_at,
        car.updated_at,
        caa.ai_assistant_id
      FROM campaign_ai_artifact_results car
      JOIN campaign_ai_artifacts caa ON caa.id = car.campaign_ai_artifact_id
    SQL

    # Create chat record for each result and migrate
    # rubocop:disable Metrics/BlockLength
    records_to_migrate.each do |record|
      chat_result = execute(<<-SQL.squish)
        INSERT INTO ai_assistant_chats (ai_assistant_id, user_id, created_at, updated_at)
        VALUES (#{record['ai_assistant_id']}, #{record['user_id']}, NOW(), NOW())
        RETURNING id;
      SQL

      chat_id = chat_result.first['id']

      execute(<<-SQL.squish)
        INSERT INTO ai_assisted_user_sessions (
          ai_assistant_chat_id,
          user_id,
          assistable_id,
          assistable_type,
          type,
          error,
          checkpoint,
          meta,
          created_at,
          updated_at
        )
        SELECT
          #{chat_id},
          #{record['user_id']},
          #{record['campaign_ai_artifact_id']},
          'AI::CampaignArtifact',
          'AI::CampaignArtifactResult',
          #{record['error'] ? connection.quote(record['error']) : 'NULL'},
          #{connection.quote(record['results'])}::jsonb,
          CASE
            WHEN #{record['parsed_dependencies'] ? connection.quote(record['parsed_dependencies']) : 'NULL'} IS NULL THEN NULL::jsonb
            ELSE to_jsonb(#{record['parsed_dependencies'] ? connection.quote(record['parsed_dependencies']) : 'NULL'}::text)
          END,
          #{connection.quote(record['created_at'])}::timestamp,
          #{connection.quote(record['updated_at'])}::timestamp;
      SQL
    end
    # rubocop:enable Metrics/BlockLength
  end

  def migrate_data_back_to_campaign_artifact_results
    return unless table_exists?(:campaign_ai_artifact_results)

    execute <<-SQL.squish
      INSERT INTO campaign_ai_artifact_results (
        user_id,
        campaign_ai_artifact_id,
        error,
        results,
        parsed_dependencies,
        created_at,
        updated_at
      )
      SELECT
        user_id,
        assistable_id,
        error,
        checkpoint,
        CASE
          WHEN meta IS NULL THEN NULL::text
          ELSE meta::text
        END,
        created_at,
        updated_at
      FROM ai_assisted_user_sessions
      WHERE type = 'AI::CampaignArtifactResult';
    SQL
  end
end
