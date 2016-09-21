class AddTypeToReportsModule < ActiveRecord::Migration[5.0]
  def change
    add_column :reports_modules, :type, :string
  end
end
