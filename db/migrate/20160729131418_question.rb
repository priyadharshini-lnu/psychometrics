class Question < ActiveRecord::Migration[5.0]
  def change
    create_table :questions do |t|
      t.string :name
      t.integer :position
      t.string :type
      t.string :props

      t.timestamps
    end
    add_reference :questions, :block
  end
end
