# frozen_string_literal: true

class CreateTranscriptions < ActiveRecord::Migration[8.0]
  def change
    create_table :transcriptions do |t|
      t.references :transcribable, polymorphic: true, null: false, index: true
      t.text :text, null: false

      t.timestamps
    end
  end
end
