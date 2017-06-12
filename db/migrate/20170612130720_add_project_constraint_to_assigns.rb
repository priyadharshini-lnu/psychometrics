class AddProjectConstraintToAssigns < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :assigns, :assigns, column: :project_assign_id
  end
end
