# frozen_string_literal: true

class ChangeOwnerOfexistingResourceFor360 < ActiveRecord::Migration[5.2]
  def change
    Threesixty::Campaign.find_each do |campaign|
      client = campaign.client
      campaign.assessment.update_column(:owner_id, client.id)
      campaign.report.update_column(:owner_id, client.id)
      campaign.assessment.dimension.update_column(:owner_id, client.id)
    end
  end
end
