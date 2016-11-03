class CreateReportsFilters < ActiveRecord::Migration[5.0]
  def change
    create_table :reports_filters do |t|
      t.references :report, index: true
      t.string :name
      t.json :conditions

      t.timestamps
    end
    remove_column :reports, :filters
  end
end
