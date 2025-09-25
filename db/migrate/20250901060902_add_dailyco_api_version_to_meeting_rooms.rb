# frozen_string_literal: true

class AddDailycoApiVersionToMeetingRooms < ActiveRecord::Migration[7.1]
  def up
    add_column :meeting_rooms, :dailyco_api_version, :string

    # Set v1 where use_old_dailyco_api is true, else v2
    execute <<-SQL.squish
      UPDATE meeting_rooms
      SET dailyco_api_version = 'v1'
      WHERE use_old_dailyco_api = TRUE
    SQL

    execute <<-SQL.squish
      UPDATE meeting_rooms
      SET dailyco_api_version = 'v2'
      WHERE use_old_dailyco_api = FALSE OR use_old_dailyco_api IS NULL
    SQL

    change_table :meeting_rooms, bulk: true do |t|
      t.change_default :dailyco_api_version, 'v2'
      t.change_null :dailyco_api_version, false
    end
  end

  def down
    remove_column :meeting_rooms, :dailyco_api_version
  end
end
