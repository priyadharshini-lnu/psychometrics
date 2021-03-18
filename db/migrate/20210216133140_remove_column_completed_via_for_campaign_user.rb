# frozen_string_literal: true

class RemoveColumnCompletedViaForCampaignUser < ActiveRecord::Migration[5.2]
  def change
    remove_column :campaign_users, :completed_via
  end
end
