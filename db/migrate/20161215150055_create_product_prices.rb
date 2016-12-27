class CreateProductPrices < ActiveRecord::Migration[5.0]
  def change
    create_table :product_prices do |t|
      t.monetize :price
      t.references :product
      t.timestamps
    end
  end
end
