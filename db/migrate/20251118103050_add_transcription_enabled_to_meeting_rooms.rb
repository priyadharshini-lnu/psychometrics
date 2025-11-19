# frozen_string_literal: true

class AddTranscriptionEnabledToMeetingRooms < ActiveRecord::Migration[8.0]
  def change
    add_column :meeting_rooms, :transcription_enabled, :boolean, default: false, null: false
  end
end
