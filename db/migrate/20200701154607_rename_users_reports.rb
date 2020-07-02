# frozen_string_literal: true

class RenameUsersReports < ActiveRecord::Migration[5.1]
  def change
    drop_table :campaigns_users_reports
    rename_table :users_reports, :campaigns_users_reports
  end
end
