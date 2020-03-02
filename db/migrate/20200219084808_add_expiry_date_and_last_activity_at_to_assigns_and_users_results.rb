# frozen_string_literal: true

class AddExpiryDateAndLastActivityAtToAssignsAndUsersResults < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns, :expiry_date, :datetime
    add_column :assigns, :last_activity_at, :datetime
    add_column :users_results, :expiry_date, :datetime
    add_column :users_results, :last_activity_at, :datetime
  end
end
