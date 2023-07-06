
class AddProctoringTrailToCampaignOptions < ActiveRecord::Migration[6.1]
  def change
    add_column :campaign_options, :proctoring_trial, :boolean, default: false
  end
end
