class RemoveUnusedTables < ActiveRecord::Migration[7.0]
  def up
    drop_table :products
    drop_table :product_reports
    drop_table :product_images
    drop_table :product_prices

    drop_table :ecommerce_purchase_invites
    drop_table :ecommerce_purchases
    drop_table :ecommerce_orders

    drop_table :tasks
  end
end
