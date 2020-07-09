# frozen_string_literal: true

class AddUserAccessToCampaignsUsersReport < ActiveRecord::Migration[5.1]
  def change
    add_column :campaigns_users_reports, :user_access, :boolean, default: false
  end
end
