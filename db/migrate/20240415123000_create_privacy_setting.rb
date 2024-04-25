class CreatePrivacySetting < ActiveRecord::Migration[7.1]
  def change
    create_table :privacy_settings do |t|
      t.boolean :mask_identity_for_third_party_assessment, default: false
      t.boolean :privacy_consent, default: false
      t.integer :custom_privacy_policy_version, default: nil
      t.text :custom_privacy_consent_text
      t.string :privacy_link_text
      t.text :privacy_link_url
    end
    add_reference :privacy_settings, :project, foreign_key: { on_delete: :cascade, to_table: :clients }

    reversible do |dir|
      dir.up do
        sql = <<~SQL
          INSERT INTO privacy_settings (project_id, privacy_consent, custom_privacy_policy_version, privacy_link_text, privacy_link_url)
          SELECT clients.id, privacy_consent, custom_privacy_policy_version, privacy_links.text, privacy_links.link FROM clients
          LEFT JOIN privacy_links ON privacy_links.client_id = clients.id
          WHERE clients.ancestry_depth = 1
        SQL
        execute(sql)
      end
    end
  end
end
