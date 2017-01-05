class CreateEcommercePurchaseInvites < ActiveRecord::Migration[5.0]
  def change
    create_table :ecommerce_purchase_invites do |t|
      t.references :purchase
      t.string :email, null: false
      t.timestamps
    end
  end
end
