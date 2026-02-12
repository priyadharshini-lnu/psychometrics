# frozen_string_literal: true

class AddErrorDetailsToTranscriptions < ActiveRecord::Migration[8.0]
  def change
    add_column :transcriptions, :error_details, :jsonb, default: {}, null: false
  end
end
