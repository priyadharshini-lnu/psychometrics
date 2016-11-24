class AddStartedAtToAssigns < ActiveRecord::Migration[5.0]
  def change
    add_column :assigns, :started_at, :datetime
  end
end
