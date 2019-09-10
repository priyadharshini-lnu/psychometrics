# frozen_string_literal: true

class AddDisplayLogicToReportPages < ActiveRecord::Migration[5.1]
  def change
    add_column :reports_pages, :display_logic, :jsonb
  end
end
