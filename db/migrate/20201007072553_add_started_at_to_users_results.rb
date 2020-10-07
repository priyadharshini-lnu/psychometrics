# frozen_string_literal: true

class AddStartedAtToUsersResults < ActiveRecord::Migration[5.1]
  def change
    add_column :users_results, :started_at, :datetime
  end
end
