class CreateCampaignTemplates < ActiveRecord::Migration[5.1]
  def change
    create_table :campaign_templates do |t|
      t.string :name
      t.integer :assessment_id
      t.integer :report_id

      t.timestamps
    end
  end
end
