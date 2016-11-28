class CreateOccupations < ActiveRecord::Migration[5.0]
  def change
    create_table :occupations do |t|
      t.string :name
      t.string :icon
      t.text :description
      t.belongs_to :dimension
      t.timestamps
    end
  end
end
