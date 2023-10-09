class AddGroupTypeToCampaignAssessmentGroup < ActiveRecord::Migration[7.0]
  def change
    add_column :campaign_assessment_groups, :group_type, :integer, default: 0, null: false # 0 - regular, 1 - assessment_center
  end
end
