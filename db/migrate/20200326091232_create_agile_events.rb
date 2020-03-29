# frozen_string_literal: true

class CreateAgileEvents < ActiveRecord::Migration[5.1]
  def change
    create_table :agile_events do |t|
      t.references :assign, foreign_key: { on_delete: :cascade }
      t.string :session_id
      t.string :event
      t.json :data, default: {}
    end
  end
end
