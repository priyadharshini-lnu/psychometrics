# frozen_string_literal: true

class BackfillReportFamilyTenants < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL.squish
      WITH ranked_owners_per_family AS (
        SELECT rfr.report_family_id,
               r.owner_id,
               COUNT(*) AS reports_count,
               ROW_NUMBER() OVER (
                 PARTITION BY rfr.report_family_id
                 ORDER BY COUNT(*) DESC, r.owner_id ASC
               ) AS rn
        FROM report_families_reports rfr
        INNER JOIN reports r ON rfr.report_id = r.id
        WHERE r.owner_id IS NOT NULL
        GROUP BY rfr.report_family_id, r.owner_id
      )
      UPDATE report_families
      SET tenant_id = ranked_owners_per_family.owner_id
      FROM ranked_owners_per_family
      WHERE report_families.id = ranked_owners_per_family.report_family_id
        AND ranked_owners_per_family.rn = 1
        AND report_families.tenant_id IS NULL
    SQL
  end

  def down
    # No-op: we don't want to clear backfilled tenants on rollback
  end
end
