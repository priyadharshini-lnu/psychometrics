# frozen_string_literal: true

class AddCampaignIdToWorkshopSubject < ActiveRecord::Migration[7.0]
  def change
    add_column :workshop_subjects, :campaign_id, :integer
  end
end
