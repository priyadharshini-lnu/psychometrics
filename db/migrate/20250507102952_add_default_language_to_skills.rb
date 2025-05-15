# frozen_string_literal: true

class AddDefaultLanguageToSkills < ActiveRecord::Migration[7.1]
  def change
    add_column :skills, :default_language, :string, default: 'en', null: false
  end
end
