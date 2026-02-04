# frozen_string_literal: true

class CreateAITranslationResults < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_translation_results do |t|
      t.json :results
      t.bigint :translatable_id
      t.string :translatable_type
      t.bigint :hashsum

      t.timestamps
    end
  end
end
