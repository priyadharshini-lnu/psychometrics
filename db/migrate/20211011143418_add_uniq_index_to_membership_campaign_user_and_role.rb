# frozen_string_literal: true

class AddUniqIndexToMembershipCampaignUserAndRole < ActiveRecord::Migration[5.2]
  def change
    add_index :memberships, %i[client_id role campaign_id], unique: true
  end
end
