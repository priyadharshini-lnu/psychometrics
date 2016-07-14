class CreateDimensions < ActiveRecord::Migration[5.0]
  def change
    create_table :dimensions do |t|
      t.string :name
      t.boolean :favourite, default: false
      t.boolean :disabled, default: false

      t.timestamps
    end
  end
end
