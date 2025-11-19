# frozen_string_literal: true

class AddTranscriptionFieldsToMeetingRecordings < ActiveRecord::Migration[8.0]
  def change
    change_table :meeting_recordings, bulk: true do |t|
      t.integer :transcription_status, default: 0, null: false
      t.string :transcription_external_id
      t.string :transcription_s3key
      t.string :meeting_session_id
    end
    add_index :meeting_recordings, :meeting_session_id
  end
end
