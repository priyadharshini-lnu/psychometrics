# frozen_string_literal: true

class CreateMeetingRooms < ActiveRecord::Migration[7.0]
  def up
    create_table :meeting_rooms, id: :uuid do |t|
      t.string :name, null: true
      t.string :external_id, null: true
      t.references :meetable, polymorphic: true
      t.timestamps
    end
  end

  def down
    drop_table :meeting_rooms
  end
end
