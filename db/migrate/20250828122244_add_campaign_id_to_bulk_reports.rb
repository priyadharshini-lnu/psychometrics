# frozen_string_literal: true

class AddCampaignIdToBulkReports < ActiveRecord::Migration[7.1]
  def change
    add_reference :bulk_reports, :campaign, foreign_key: true, null: true
  end
end
