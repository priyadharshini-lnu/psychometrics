class RemoveFavourite < ActiveRecord::Migration[5.0]
  def change
    remove_column :dimensions, :favourite
  end
end
