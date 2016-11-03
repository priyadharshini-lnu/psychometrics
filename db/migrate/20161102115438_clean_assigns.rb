class CleanAssigns < ActiveRecord::Migration[5.0]
  def change
    remove_index :assigns, [:client_id, :assessment_id, :user_id]
    remove_column :assigns, :client_id, :integer
    remove_column :assigns, :user_id, :integer
  end
end
