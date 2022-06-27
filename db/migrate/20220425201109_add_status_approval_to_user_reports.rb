# frozen_string_literal: true

class AddStatusApprovalToUserReports < ActiveRecord::Migration[5.2]
  def change
    add_column :user_reports, :approved, :boolean, default: false
  end
end
