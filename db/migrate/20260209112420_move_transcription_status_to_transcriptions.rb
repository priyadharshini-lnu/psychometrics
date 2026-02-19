# frozen_string_literal: true

class MoveTranscriptionStatusToTranscriptions < ActiveRecord::Migration[8.0]
  def up
    add_column :transcriptions, :status, :integer, default: 0, null: false
    add_index :transcriptions, :status

    # Migrate existing statuses from media_responses to transcriptions
    execute <<-SQL.squish
      UPDATE transcriptions
      SET status = media_responses.transcription_status
      FROM media_responses
      WHERE transcriptions.transcribable_type = 'MediaResponse'
        AND transcriptions.transcribable_id = media_responses.id
        AND media_responses.transcription_status IS NOT NULL
    SQL

    remove_column :media_responses, :transcription_status, :integer
  end

  def down
    add_column :media_responses, :transcription_status, :integer, default: 0, null: false
    add_index :media_responses, :transcription_status

    # Move status back from transcriptions to media_responses
    execute <<-SQL.squish
      UPDATE media_responses
      SET transcription_status = transcriptions.status
      FROM transcriptions
      WHERE transcriptions.transcribable_type = 'MediaResponse'
        AND transcriptions.transcribable_id = media_responses.id
        AND transcriptions.status IS NOT NULL
    SQL

    remove_column :transcriptions, :status, :integer
  end
end
