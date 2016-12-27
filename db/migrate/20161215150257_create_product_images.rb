class CreateProductImages < ActiveRecord::Migration[5.0]
  def change
    create_table :product_images do |t|
      t.string :image
      t.integer :position
      t.references :product

      t.timestamps
    end
  end
end
