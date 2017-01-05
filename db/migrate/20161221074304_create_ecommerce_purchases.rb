class CreateEcommercePurchases < ActiveRecord::Migration[5.0]
  def change
    create_table :ecommerce_purchases do |t|
      t.references :order
      t.references :product
      t.monetize :price
      t.integer :quantity, default: 1
      t.timestamps
    end
  end
end
