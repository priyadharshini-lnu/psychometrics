# frozen_string_literal: true

class CreateAgiles < ActiveRecord::Migration[5.1]
  def change
    create_table :agiles do |t|
      t.references :assessment, foreign_key: { on_delete: :cascade }
      t.json :config, default: {}
      t.json :translations, default: {}
    end
  end
end
