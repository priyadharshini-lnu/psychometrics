class AddMindmillToReports < ActiveRecord::Migration[5.0]
  def change
    add_column :reports, :mindmill, :boolean, default: false
    add_column :assigns, :mindmill_report, :string
  end
end
