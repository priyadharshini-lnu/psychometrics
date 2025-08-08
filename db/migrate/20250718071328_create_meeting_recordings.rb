# frozen_string_literal: true

class CreateMeetingRecordings < ActiveRecord::Migration[7.1]
  def change
    create_table :meeting_recordings do |t|
      t.references :meeting_room, null: false, foreign_key: { on_delete: :cascade }, type: :uuid
      t.string :external_id
      t.string :s3key
      t.integer :status, null: false, default: 0

      t.timestamps
    end
  end
end
