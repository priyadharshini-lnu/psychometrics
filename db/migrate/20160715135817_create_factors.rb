class CreateFactors < ActiveRecord::Migration[5.0]
  def change
    create_table :factors do |t|
      t.string :name
      t.integer :subfactors_count, default: 0
      t.integer :questions_count, default: 0
      t.timestamps
    end

    add_reference :factors, :dimension
  end
end
