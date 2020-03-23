# frozen_string_literal: true

class CreateGames < ActiveRecord::Migration[5.1]
  def change
    create_table :games do |t|
      t.references :assessment, foreign_key: { on_delete: :cascade }
      t.json :config, default: {}
      t.json :translations, default: {}
    end
  end
end
