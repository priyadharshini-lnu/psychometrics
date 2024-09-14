class AddNotNullConstraintToCampaignTemplates < ActiveRecord::Migration[7.1]
  def change
    CampaignTemplate.where("assessment_id IS NULL OR report_id IS NULL OR name IS NULL").destroy_all

    change_column_null :campaign_templates, :assessment_id, false
    change_column_null :campaign_templates, :report_id, false
    change_column_null :campaign_templates, :name, false
  end
end
