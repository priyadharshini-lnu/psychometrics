# frozen_string_literal: true

class AddOwnerIdToSkills < ActiveRecord::Migration[7.1]
  def change
    add_column :skills, :owner_id, :integer
  end
end
