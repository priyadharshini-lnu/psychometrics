class CreateEcommerceOrders < ActiveRecord::Migration[5.0]
  def change
    create_table :ecommerce_orders do |t|
      t.references :membership
      t.integer :status, default: 0
      t.timestamps
    end
  end
end
