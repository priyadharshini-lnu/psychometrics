# frozen_string_literal: true

class AddCampaignAssessmentGroupIdToCommunicationDeliveries < ActiveRecord::Migration[7.1]
  def change
    add_column :communication_deliveries, :campaign_assessment_group_id, :bigint
    add_foreign_key :communication_deliveries, :campaign_assessment_groups
    add_index :communication_deliveries, :campaign_assessment_group_id
  end
end
