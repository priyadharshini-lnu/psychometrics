# frozen_string_literal: true

class AddSegmentsToTranscriptions < ActiveRecord::Migration[7.1]
  def change
    add_column :transcriptions, :segments, :jsonb, default: [], null: false
  end
end
