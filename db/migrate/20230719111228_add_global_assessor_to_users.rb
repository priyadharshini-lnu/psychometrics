class AddGlobalAssessorToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :global_assessor, :boolean, default: false
  end
end
