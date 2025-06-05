# frozen_string_literal: true

class AddCampaignAssessmentGroupIdToWorkshop < ActiveRecord::Migration[7.1]
  def change
    add_reference :workshops, :campaign_assessment_group, foreign_key: { on_delete: :nullify }
  end
end
