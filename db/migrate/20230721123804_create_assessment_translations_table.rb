class CreateAssessmentTranslationsTable < ActiveRecord::Migration[7.0]
  def change
    create_table :assessment_translations do |t|
      # Translated attribute(s)
      t.text :name
      t.text :description
      t.text :timing

      t.string :locale, null: false
      t.references :assessment, null: false, foreign_key: true, index: false

      t.timestamps null: false
    end

    add_index :assessment_translations, :locale
    add_index :assessment_translations, %i[assessment_id locale], unique: true,
     name: :index_assessment_t18n_tables_on_assessment_id_and_locale
  end
end
