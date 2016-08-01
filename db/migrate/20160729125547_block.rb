class Block < ActiveRecord::Migration[5.0]
  def change
    create_table :blocks do |t|
      t.string :name
      t.integer :position

      t.timestamps
    end
    add_reference :blocks, :assessment
  end
end
