# frozen_string_literal: true

class AddTranslationFieldsToIdpTemplates < ActiveRecord::Migration[7.1]
  def change
    change_table :idp_template_translations, bulk: true do |t|
      t.string :title_text
      t.string :subtitle_text
    end
  end
end
