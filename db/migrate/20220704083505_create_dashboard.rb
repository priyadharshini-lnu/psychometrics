# frozen_string_literal: true

class CreateDashboard < ActiveRecord::Migration[5.2]
  def change
    create_table :dashboards do |t|
      t.references :campaign, foreign_key: { on_delete: :cascade }
      t.string :name
      t.string :dataset_id
      t.string :report_id
      t.boolean :enabled, default: false
    end
  end
end
