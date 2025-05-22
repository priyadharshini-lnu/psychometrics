# frozen_string_literal: true

class AddCustomizationFieldsToIdpTemplates < ActiveRecord::Migration[7.1]
  def change
    change_table :idp_templates, bulk: true do |t|
      t.string :title_text
      t.string :subtitle_text
      t.json :fields, default: %w[name role assigned_data division review_date publish_date completion_date]
      t.integer :logo_type, default: 3
      t.boolean :show_reflections, default: true
    end
  end
end
