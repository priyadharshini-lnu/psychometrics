class Test < ActiveRecord::Migration[5.0]
  def change
    remove_index :results, :client_id
    remove_index :results, :assessment_id
    remove_index :results, :user_id
    add_index :results, [:client_id, :assessment_id, :user_id]
  end
end
