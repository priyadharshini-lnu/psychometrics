class AddCustomPrivacyConsentSettigTranslations < ActiveRecord::Migration[7.1]
  def change
    create_table :privacy_setting_translations do |t|
      t.text :custom_privacy_consent_text

      t.string :locale, null: false
      t.references :privacy_setting, null: false, foreign_key: true, index: false

      t.timestamps null: false
    end

    add_index :privacy_setting_translations, :locale
    add_index :privacy_setting_translations, %i[privacy_setting_id locale], unique: true,
      name: :index_privacy_setting_t18n_on_privacy_setting_id_and_locale
  end
end
