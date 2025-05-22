# frozen_string_literal: true

class UpdateSkillsIndex < ActiveRecord::Migration[7.1]
  def change
    remove_index :skills, :name

    add_index :skills, %i[project_id name], unique: true
  end
end
