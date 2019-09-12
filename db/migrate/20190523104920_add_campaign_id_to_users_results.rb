# frozen_string_literal: true

class AddCampaignIdToUsersResults < ActiveRecord::Migration[5.1]
  def change
    add_reference :users_results, :campaign
  end
end
