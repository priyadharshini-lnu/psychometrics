# frozen_string_literal: true

class AddDataOnlyToReports < ActiveRecord::Migration[5.2]
  def change
    add_column :reports, :data_only, :boolean, default: false
  end
end
