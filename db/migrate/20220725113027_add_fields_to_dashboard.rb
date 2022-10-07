# frozen_string_literal: true

class AddFieldsToDashboard < ActiveRecord::Migration[5.2]
  def change
    add_column :dashboards, :refresh_interval, :integer, default: 15
    add_column :dashboards, :image, :string
    add_column :dashboards, :last_refreshed_at, :datetime
  end
end
