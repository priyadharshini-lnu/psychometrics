# frozen_string_literal: true

class AddUseOldDailycoApiToMeetingRooms < ActiveRecord::Migration[7.1]
  def change
    add_column :meeting_rooms, :use_old_dailyco_api, :boolean, default: false, null: false

    reversible do |dir|
      dir.up do
        # Mark all existing meeting rooms to use old Daily.co API
        execute <<-SQL.squish
          UPDATE meeting_rooms
          SET use_old_dailyco_api = true
        SQL
      end
    end
  end
end
