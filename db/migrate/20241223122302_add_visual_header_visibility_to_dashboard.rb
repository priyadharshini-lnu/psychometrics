# frozen_string_literal: true

class AddVisualHeaderVisibilityToDashboard < ActiveRecord::Migration[7.1]
  def change
    add_column :dashboards, :visual_header_visibility, :integer, limit: 2, default: 0
  end
end
