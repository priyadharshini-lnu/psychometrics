# frozen_string_literal: true

class RemoveDefaultLanguageColumnFromDevelopmentActionsAndSkills < ActiveRecord::Migration[7.1]
  def change
    remove_column :development_actions, :default_language, :string
    remove_column :skills, :default_language, :string
  end
end
