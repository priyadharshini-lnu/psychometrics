# frozen_string_literal: true

class AddSkillSettingsToIdpTemplates < ActiveRecord::Migration[7.1]
  def change
    add_column :idp_templates, :skill_settings, :jsonb, default: {}, null: false
  end
end
