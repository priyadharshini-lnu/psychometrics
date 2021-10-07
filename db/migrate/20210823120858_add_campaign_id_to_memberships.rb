# frozen_string_literal: true

class AddCampaignIdToMemberships < ActiveRecord::Migration[5.2]
  def change
    add_column :memberships, :campaign_id, :integer
  end
end
