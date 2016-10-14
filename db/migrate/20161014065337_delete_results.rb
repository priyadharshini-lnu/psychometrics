class DeleteResults < ActiveRecord::Migration[5.0]
  def change
    drop_table :results
  end
end
