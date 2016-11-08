class DeleteQestionsCountFromFactor < ActiveRecord::Migration[5.0]
  def change
    remove_column :factors, :questions_count
  end
end
