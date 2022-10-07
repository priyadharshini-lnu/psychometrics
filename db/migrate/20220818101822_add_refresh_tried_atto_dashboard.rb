# frozen_string_literal: true

class AddRefreshTriedAttoDashboard < ActiveRecord::Migration[6.1]
  def change
    add_column :dashboards, :refresh_tried_at, :datetime
  end
end
