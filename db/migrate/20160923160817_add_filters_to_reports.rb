class AddFiltersToReports < ActiveRecord::Migration[5.0]
  def change
    add_column :reports, :filters, :json
  end
end
