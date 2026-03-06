# frozen_string_literal: true

class CreateAssessmentConsentSettingTranslations < ActiveRecord::Migration[8.0]
  def change
    create_table :assessment_consent_setting_translations do |t|
      t.text :custom_consent_text

      t.string :locale, null: false
      t.references :assessment_consent_setting, null: false, foreign_key: true, index: false

      t.timestamps null: false
    end

    add_index :assessment_consent_setting_translations, :locale
    add_index :assessment_consent_setting_translations, %i[assessment_consent_setting_id locale], unique: true,
      name: :index_acst_setting_t18n_on_consent_setting_id_and_locale
  end
end
