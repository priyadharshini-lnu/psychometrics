# frozen_string_literal: true

class AddDescriptionToReportsCampaignFactors < ActiveRecord::Migration[7.1]
  def change
    add_column :reports_campaign_factors, :description, :text
  end
end
