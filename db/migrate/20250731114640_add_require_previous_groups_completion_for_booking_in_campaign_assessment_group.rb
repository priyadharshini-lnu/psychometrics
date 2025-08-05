# frozen_string_literal: true

class AddRequirePreviousGroupsCompletionForBookingInCampaignAssessmentGroup < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_assessment_groups, :require_previous_groups_completion_for_booking, :boolean, default: false
  end
end
