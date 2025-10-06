class AddProjectInfoToLicenses < ActiveRecord::Migration[7.1]
  def change
    change_table :licenses, bulk: true do |t|
      t.boolean :is_project_specific, default: false, null: false
      t.integer :project_ids, array: true, default: []
    end
  end
end
