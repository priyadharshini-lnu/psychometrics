# frozen_string_literal: true

class ExecutePrivacySettingQueries < ActiveRecord::Migration[7.1]
  def change
    reversible do |dir|
      dir.up do
        sql_1 = <<~SQL
          UPDATE privacy_settings AS ps
          SET 
            enable_privacy_link = TRUE
          FROM privacy_links AS pl
          WHERE 
              ps.project_id = pl.client_id
        SQL

        sql_2 = <<~SQL
          UPDATE privacy_settings
          SET custom_privacy_consent = clients.custom_privacy_consent
          FROM clients
          WHERE privacy_settings.project_id = clients.id and clients.ancestry_depth = 1
        SQL

        sql_3 = <<~SQL
          INSERT INTO privacy_setting_translations (custom_privacy_consent_text, locale, privacy_setting_id, created_at, updated_at)
          SELECT ct.custom_privacy_consent_text, ct.locale, p_setting.id, NOW(), NOW()
          FROM client_translations ct
          LEFT OUTER JOIN privacy_settings p_setting ON ct.client_id = p_setting.project_id
          WHERE p_setting.project_id = ct.client_id;
        SQL
        
        execute(sql_1)
        execute(sql_2)
        execute(sql_3)
      end
    end
  end
end
