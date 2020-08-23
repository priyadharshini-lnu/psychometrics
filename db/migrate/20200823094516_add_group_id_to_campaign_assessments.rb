# frozen_string_literal: true

class AddGroupIdToCampaignAssessments < ActiveRecord::Migration[5.1]
  def change
    add_reference :campaign_assessments, :campaign_assessment_groups, foreign_key: { on_delete: :cascade }
  end
end
