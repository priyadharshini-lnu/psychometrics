# frozen_string_literal: true

class AddSkillSourcePreferenceToIdpTemplates < ActiveRecord::Migration[7.1]
  def change
    add_column :idp_templates, :skill_source_preference, :integer, default: 0
  end
end
