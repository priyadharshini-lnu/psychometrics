class AddProjectAssignIdToAssigns < ActiveRecord::Migration[5.0]
  def change
     change_table :assigns do |t|
      t.column :project_assign_id, :integer, index: true
    end
  end
end
