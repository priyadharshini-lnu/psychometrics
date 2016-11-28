class CreateOccupationsFactor < ActiveRecord::Migration[5.0]
  def change
    create_table :occupations_factors do |t|
      t.belongs_to :occupation
      t.belongs_to :factor
      t.string :predicate
      t.float :value

      t.timestamps
    end
  end
end
