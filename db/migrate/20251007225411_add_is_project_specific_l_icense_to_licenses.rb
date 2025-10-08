class AddIsProjectSpecificLIcenseToLicenses < ActiveRecord::Migration[7.1]
  def change
    add_column :licenses, :is_project_specific, :boolean, default: false, null: false
  end
end
