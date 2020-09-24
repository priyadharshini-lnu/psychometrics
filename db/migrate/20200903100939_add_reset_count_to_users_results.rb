# frozen_string_literal: true

class AddResetCountToUsersResults < ActiveRecord::Migration[5.1]
  def change
    add_column :users_results, :reset_count, :integer, default: 0
  end
end
