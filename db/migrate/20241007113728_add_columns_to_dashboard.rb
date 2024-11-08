# frozen_string_literal: true

class AddColumnsToDashboard < ActiveRecord::Migration[7.1]
  def change
    change_table :dashboards do |t|
      t.integer :dashboard_type, default: 0, null: false
      t.string :project_path
    end
  end
end
