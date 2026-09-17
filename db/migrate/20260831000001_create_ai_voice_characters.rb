# frozen_string_literal: true

class CreateAIVoiceCharacters < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_voice_characters do |t|
      t.string :name, null: false
      t.integer :provider, default: 0, null: false
      t.string :external_voice_id, null: false
      t.string :locale
      t.string :style
      t.string :rate
      t.string :pitch
      t.references :tenant, foreign_key: { to_table: :clients }
      t.references :last_modified_by, foreign_key: { to_table: :users }

      t.timestamps
    end
  end
end
