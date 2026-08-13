# frozen_string_literal: true

class BackfillCampaignAssessmentGroupNameTranslations < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL.squish
      INSERT INTO campaign_assessment_group_translations
        (name, locale, campaign_assessment_group_id, tenant_id, created_at, updated_at)
      SELECT
        campaign_assessment_groups.name,
        'en',
        campaign_assessment_groups.id,
        campaign_assessment_groups.tenant_id,
        NOW(),
        NOW()
      FROM campaign_assessment_groups
      WHERE campaign_assessment_groups.name IS NOT NULL
      ON CONFLICT (campaign_assessment_group_id, locale)
      DO UPDATE SET
        name = EXCLUDED.name,
        tenant_id = EXCLUDED.tenant_id,
        updated_at = NOW()
    SQL
  end

  def down
    execute <<~SQL.squish
      DELETE FROM campaign_assessment_group_translations
      WHERE locale = 'en'
    SQL
  end
end
