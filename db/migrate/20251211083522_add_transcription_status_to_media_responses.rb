# frozen_string_literal: true

class AddTranscriptionStatusToMediaResponses < ActiveRecord::Migration[8.0]
  def change
    add_column :media_responses, :transcription_status, :integer, default: 0, null: false

    add_index :media_responses, :transcription_status
  end
end
