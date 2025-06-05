# frozen_string_literal: true

class RenameCategoryColumnForDevelopmentActionsAndSkills < ActiveRecord::Migration[7.1]
  def change
    rename_column :development_actions, :category, :development_action_type
    rename_column :skills, :category, :skill_type
  end
end
