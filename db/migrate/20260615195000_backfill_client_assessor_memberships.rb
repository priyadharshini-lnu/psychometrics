# frozen_string_literal: true

class BackfillClientAssessorMemberships < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL.squish
      INSERT INTO memberships (user_id, client_id, role, campaign_id, tenant_id, created_at, updated_at)
      SELECT DISTINCT assessors.user_id::integer,
             ttes.id::integer,
             5::integer,
             NULL::integer,
             ttes.id::integer,
             NOW(),
             NOW()
      FROM assessors
      INNER JOIN campaigns ON campaigns.id = assessors.campaign_id
      INNER JOIN clients as projects ON projects.id = campaigns.project_id
      INNER JOIN clients as ttes ON ttes.id = projects.tte_id
                              AND ttes.ancestry_depth = 0
      LEFT JOIN memberships existing
        ON existing.user_id = assessors.user_id
       AND existing.client_id = ttes.id
       AND existing.role = 5::integer
       AND existing.campaign_id IS NULL
      WHERE existing.id IS NULL
    SQL
  end

  def down
    # No-op: we don't want to clear data on rollback as it's a backfill
  end
end
