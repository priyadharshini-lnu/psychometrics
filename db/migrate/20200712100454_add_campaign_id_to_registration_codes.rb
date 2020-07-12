# frozen_string_literal: true

class AddCampaignIdToRegistrationCodes < ActiveRecord::Migration[5.1]
  def change
    add_column :registration_codes, :campaign_id, :integer
  end
end
