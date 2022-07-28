# frozen_string_literal: true

class AddUserDashboardToCampaignReports < ActiveRecord::Migration[6.1]
  def change
    add_column :campaign_reports, :user_dashboard, :boolean, default: false
  end
end
