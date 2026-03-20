# frozen_string_literal: true

class AddUniqueIndexToTranscriptions < ActiveRecord::Migration[8.0]
  def up
    remove_duplicate_transcriptions
    add_index :transcriptions, %i[transcribable_type transcribable_id],
              unique: true,
              name: 'index_transcriptions_on_transcribable_unique'
  end

  def down
    remove_index :transcriptions, name: 'index_transcriptions_on_transcribable_unique'
  end

  private

  def remove_duplicate_transcriptions
    execute(<<~SQL.squish)
      DELETE FROM transcriptions
      WHERE id NOT IN (
        SELECT DISTINCT ON (transcribable_type, transcribable_id) id
        FROM transcriptions
        ORDER BY transcribable_type, transcribable_id, updated_at DESC
      )
    SQL
  end
end
