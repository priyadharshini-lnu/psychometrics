# frozen_string_literal: true

class AddUniqIndexToMembershipClientCampaignUserAndRole < ActiveRecord::Migration[5.2]
  def change
    add_index :memberships, %i[client_id user_id role campaign_id], unique: true, name: 'membership_columns_uniq_index'
  end
end
