# frozen_string_literal: true

class CreateThreesixtyInstructionTemplateContentTranslationsForMobilityTableBackend < ActiveRecord::Migration[5.2]
  def change
    create_table :threesixty_instruction_template_translations do |t|
      # Translated attribute(s)
      t.text :content

      t.string :locale, null: false
      t.references :threesixty_instruction_template, null: false, foreign_key: true, index: false

      t.timestamps null: false
    end

    add_index :threesixty_instruction_template_translations, :locale,
              name: :index_threesixty_instruction_template_translations_on_locale
    add_index :threesixty_instruction_template_translations, %i[threesixty_instruction_template_id locale],
              name: :index_53a664e244a4bc3ce19609177c48692ee2fa83fa, unique: true
  end
end
