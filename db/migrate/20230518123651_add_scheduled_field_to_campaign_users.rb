# frozen_string_literal: true

class AddScheduledFieldToCampaignUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :campaign_users, :schedule_start_date, :datetime
    add_column :campaign_users, :schedule_end_date, :datetime
  end
end
