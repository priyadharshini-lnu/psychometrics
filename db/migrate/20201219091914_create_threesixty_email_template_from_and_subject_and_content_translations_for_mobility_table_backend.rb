# frozen_string_literal: true

# rubocop:disable Layout/LineLength
class CreateThreesixtyEmailTemplateFromAndSubjectAndContentTranslationsForMobilityTableBackend < ActiveRecord::Migration[5.2]
  # rubocop:enable Layout/LineLength
  def change
    create_table :threesixty_email_template_translations do |t|
      # Translated attribute(s)
      t.string :subject
      t.text :content

      t.string :locale, null: false
      t.references :threesixty_email_template, null: false, foreign_key: true, index: false

      t.timestamps null: false
    end

    add_index :threesixty_email_template_translations, :locale,
              name: :index_threesixty_email_template_translations_on_locale
    add_index :threesixty_email_template_translations, %i[threesixty_email_template_id locale],
              name: :index_887f45023887ef83411209851cdd913a49fb74dd, unique: true
  end
end
