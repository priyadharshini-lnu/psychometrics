class AddStylesToReports < ActiveRecord::Migration[7.1]
  def change
    add_column :reports, :styles, :jsonb, default: {}
  end
end
