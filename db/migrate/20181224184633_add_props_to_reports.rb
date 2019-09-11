# frozen_string_literal: true

class AddPropsToReports < ActiveRecord::Migration[5.1]
  def change
    add_column :reports, :props, :jsonb, null: false, default: {}
  end
end
