# frozen_string_literal: true

class BackfillPrivacyLinkTextTranslations < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL.squish
      INSERT INTO privacy_setting_translations
        (privacy_link_text, locale, privacy_setting_id, tenant_id, created_at, updated_at)
      SELECT
        privacy_settings.privacy_link_text,
        'en',
        privacy_settings.id,
        privacy_settings.tenant_id,
        NOW(),
        NOW()
      FROM privacy_settings
      WHERE privacy_settings.privacy_link_text IS NOT NULL
      ON CONFLICT (privacy_setting_id, locale)
      DO UPDATE SET
        privacy_link_text = EXCLUDED.privacy_link_text,
        tenant_id = EXCLUDED.tenant_id,
        updated_at = NOW()
    SQL
  end

  def down
    execute <<~SQL.squish
      UPDATE privacy_setting_translations
      SET privacy_link_text = NULL
      WHERE locale = 'en'
    SQL
  end
end
