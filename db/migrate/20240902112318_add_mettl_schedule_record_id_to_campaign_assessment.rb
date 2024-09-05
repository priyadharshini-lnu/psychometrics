# frozen_string_literal: true

class AddMettlScheduleRecordIdToCampaignAssessment < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_assessments, :mettl_schedule_record_id, :bigint
  end
end
