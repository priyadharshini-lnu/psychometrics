# frozen_string_literal: true

class RenameCampaignRelatedTable < ActiveRecord::Migration[5.1]
  def change
    rename_table :campaigns_reports, :campaign_reports
    rename_table :campaigns_assessments, :campaign_assessments
    rename_table :users_campaigns_assessments, :user_assessments
    rename_table :campaigns_users_reports, :user_reports

    rename_table :campaigns_users, :campaign_users
    rename_column :communication_emails, :campaigns_user_id, :campaign_user_id
    remove_column :hogan_credentials, :campaigns_user_id
  end
end
