class CreateDimensions < ActiveRecord::Migration[5.0]
  def change
    create_table :dimensions do |t|
      t.string :name
      t.boolean :favourite
      t.boolean :disabled

      t.timestamps
    end
  end
end
