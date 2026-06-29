# frozen_string_literal: true

class AddScopeToDataReports < ActiveRecord::Migration[8.0]
  def change
    add_column :data_reports, :scope, :integer, default: 0, null: false
    add_index :data_reports, :scope
  end
end
