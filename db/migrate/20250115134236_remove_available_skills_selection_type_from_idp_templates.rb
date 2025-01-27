# frozen_string_literal: true

class RemoveAvailableSkillsSelectionTypeFromIdpTemplates < ActiveRecord::Migration[7.1]
  def change
    remove_column :idp_templates, :available_skills_selection_type, :integer
  end
end
