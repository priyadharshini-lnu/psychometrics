# frozen_string_literal: true

class BackfillCampaignNameTranslations < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL.squish
      INSERT INTO campaign_translations
        (name, locale, campaign_id, tenant_id, created_at, updated_at)
      SELECT
        campaigns.name,
        'en',
        campaigns.id,
        campaigns.tenant_id,
        NOW(),
        NOW()
      FROM campaigns
      WHERE campaigns.name IS NOT NULL
      ON CONFLICT (campaign_id, locale)
      DO UPDATE SET
        name = EXCLUDED.name,
        tenant_id = EXCLUDED.tenant_id,
        updated_at = NOW()
    SQL
  end

  def down
    execute <<~SQL.squish
      DELETE FROM campaign_translations
      WHERE locale = 'en'
    SQL
  end
end
