# frozen_string_literal: true

class AddStatusToCampaignUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :campaign_users, :status, :integer, default: 0

    CampaignUser.joins(:campaign).where(campaigns: { type: :common }).find_each do |campaign_user|
      campaign_user.update(status: campaign_user.completion_status)
      CampaignUsers::SetCompletionStatus.call!(campaign_user)
    end
  end
end
