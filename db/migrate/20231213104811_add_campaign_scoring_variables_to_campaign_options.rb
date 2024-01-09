class AddCampaignScoringVariablesToCampaignOptions < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_options, :campaign_scoring_variables, :text
  end
end
