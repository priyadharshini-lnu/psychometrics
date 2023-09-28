# frozen_string_literal: true

class CreateWorkshopResources < ActiveRecord::Migration[7.0]
  def change
    create_table :workshop_resources do |t|
      t.string :name
      t.string :url
      t.references :workshop, foreign_key: { on_delete: :cascade }
    end
  end
end
