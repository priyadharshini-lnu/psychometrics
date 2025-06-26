# frozen_string_literal: true

class AddColumnsToIdpTemplate < ActiveRecord::Migration[7.1]
  def change
    add_column :idp_templates, :instructions, :jsonb, default: {}, null: false

    create_table :idp_template_translations do |t|
      t.jsonb :instructions, default: {}, null: false
      t.string :locale, null: false
      t.references :idp_template, null: false, foreign_key: true, index: false

      t.timestamps null: false
    end
    add_index :idp_template_translations, :locale
    add_index :idp_template_translations, %i[idp_template_id locale], unique: true
  end
end
