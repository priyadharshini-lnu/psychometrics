# frozen_string_literal: true

class AddPrivateToUserIdpSkills < ActiveRecord::Migration[7.1]
  def change
    add_column :user_idp_skills, :private, :boolean, default: false, null: false
    add_index :user_idp_skills, :private
  end
end
