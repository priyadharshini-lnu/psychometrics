# frozen_string_literal: true

class AddJobRolesToCampaignUsers < ActiveRecord::Migration[7.1]
  def change
    add_reference :campaign_users, :current_job_role, foreign_key: { to_table: :job_roles }, null: true
    add_reference :campaign_users, :target_job_role, foreign_key: { to_table: :job_roles }, null: true
  end
end
