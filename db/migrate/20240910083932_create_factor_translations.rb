# frozen_string_literal: true

class CreateFactorTranslations < ActiveRecord::Migration[7.1]
  def change
    create_table :factor_translations do |t|
      t.string :locale, null: false
      t.string :name
      t.string :description
      t.references :factor, null: false, foreign_key: { on_delete: :cascade }, index: false

      t.timestamps
    end

    add_index :factor_translations, :locale, name: :index_factor_translations_on_locale
    add_index :factor_translations, %i[name locale], name: :index_factor_translations_on_name_and_locale
    add_index :factor_translations, %i[description locale], name: :index_factor_translations_on_description_and_locale

    reversible do |dir|
      dir.up do
        sql = <<~SQL.squish
          INSERT INTO factor_translations (locale, name, description, factor_id, created_at, updated_at)
          SELECT 'en' as locale, factors.name, factors.description, factors.id, NOW(), NOW()
          FROM factors
        SQL
        execute(sql)
      end
      dir.down do
        execute('DELETE FROM factor_translations')
      end
    end
  end
end
