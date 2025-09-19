# frozen_string_literal: true

class RemoveUseOldDailycoApiFromMeetingRooms < ActiveRecord::Migration[7.1]
  def change
    remove_column :meeting_rooms, :use_old_dailyco_api, :boolean
  end
end
