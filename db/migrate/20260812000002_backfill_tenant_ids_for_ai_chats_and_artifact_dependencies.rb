# frozen_string_literal: true

class BackfillTenantIdsForAIChatsAndArtifactDependencies < ActiveRecord::Migration[8.0]
  def up
    # Step 1: backfill ai_assistant_chats — prefer session tenant, then user tenant
    execute(<<~SQL.squish)
      UPDATE ai_assistant_chats
      SET tenant_id = COALESCE(s.tenant_id, u.tenant_id)
      FROM ai_assisted_user_sessions s,
           users u
      WHERE u.id = ai_assistant_chats.user_id
        AND s.id = ai_assistant_chats.ai_assisted_user_session_id
        AND ai_assistant_chats.tenant_id IS NULL
        AND COALESCE(s.tenant_id, u.tenant_id) IS NOT NULL
    SQL

    # Step 2: fallback for chats with no session (use user tenant directly)
    execute(<<~SQL.squish)
      UPDATE ai_assistant_chats
      SET tenant_id = u.tenant_id
      FROM users u
      WHERE u.id = ai_assistant_chats.user_id
        AND ai_assistant_chats.tenant_id IS NULL
        AND u.tenant_id IS NOT NULL
    SQL

    # Step 3: backfill campaign_ai_artifact_dependencies via their parent artifact
    execute(<<~SQL.squish)
      UPDATE campaign_ai_artifact_dependencies
      SET tenant_id = art.tenant_id
      FROM campaign_ai_artifacts art
      WHERE art.id = campaign_ai_artifact_dependencies.campaign_ai_artifact_id
        AND campaign_ai_artifact_dependencies.tenant_id IS NULL
        AND art.tenant_id IS NOT NULL
    SQL
  end

  def down
    # No-op: we don't want to clear backfilled tenant_ids on rollback
  end
end
