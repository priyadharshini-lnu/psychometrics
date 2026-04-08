# frozen_string_literal: true

class AddReportCustomizationToIdpTemplates < ActiveRecord::Migration[7.0]
  def change
    change_table :idp_templates, bulk: true do |t|
      t.integer :guideline_position, default: 0
      t.boolean :flip_background, default: false
      t.jsonb :page_styles, default: {}, null: false
      t.boolean :show_guidelines, default: true
    end
  end
end
