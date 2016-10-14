class AddStepToAssign < ActiveRecord::Migration[5.0]
  def change
    add_column :assigns, :step, :integer
  end
end
