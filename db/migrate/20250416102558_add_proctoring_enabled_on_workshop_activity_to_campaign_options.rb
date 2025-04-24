# frozen_string_literal: true

class AddProctoringEnabledOnWorkshopActivityToCampaignOptions < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_options, :proctoring_enabled_on_workshop_activity, :boolean, default: true
  end
end
