# frozen_string_literal: true

class AddProgressToUsersResults < ActiveRecord::Migration[5.2]
  def change
    add_column :users_results, :progress, :integer
  end
end
