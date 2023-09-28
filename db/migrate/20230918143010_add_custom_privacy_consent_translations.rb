class AddCustomPrivacyConsentTranslations < ActiveRecord::Migration[6.1]
  def change
    create_table :client_translations do |t|
      # Translated attribute(s)
      t.text :custom_privacy_consent_text

      t.string :locale, null: false
      t.references :client, null: false, foreign_key: true, index: false

      t.timestamps null: false
    end

    add_index :client_translations, :locale
    add_index :client_translations, %i[client_id locale], unique: true,
     name: :index_client_t18n_tables_on_client_id_and_locale
  end
end
