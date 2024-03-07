class AddProctoringTypeToCampaignOptions < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_options, :proctoring_type, :integer, default: 0, null: false
  end
end
