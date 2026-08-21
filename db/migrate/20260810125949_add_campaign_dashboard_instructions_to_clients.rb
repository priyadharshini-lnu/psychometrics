# frozen_string_literal: true

class AddCampaignDashboardInstructionsToClients < ActiveRecord::Migration[8.0]
  def up
    add_column :clients, :campaign_dashboard_instructions, :text
    add_column :client_translations, :campaign_dashboard_instructions, :text
  end

  def down
    remove_column :clients, :campaign_dashboard_instructions
    remove_column :client_translations, :campaign_dashboard_instructions
  end
end
