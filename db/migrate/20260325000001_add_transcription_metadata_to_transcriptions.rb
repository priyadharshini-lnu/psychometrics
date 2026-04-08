# frozen_string_literal: true

class AddTranscriptionMetadataToTranscriptions < ActiveRecord::Migration[8.0]
  def change
    add_column :transcriptions, :metadata, :jsonb, default: {}, null: false
  end
end
