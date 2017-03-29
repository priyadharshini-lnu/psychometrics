class MergeWithStage2 < ActiveRecord::Migration[5.0]
  def change
    rename_table :assessment_clients, :assign_clients
  end
end
