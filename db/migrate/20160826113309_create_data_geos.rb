class CreateDataGeos < ActiveRecord::Migration[5.0]
  def change
    create_table :data_geos do |t|
      t.string :country_code
      t.string :country_name
      t.string :region_code
      t.string :region_name
      t.string :city

      t.timestamps
    end
  end
end
