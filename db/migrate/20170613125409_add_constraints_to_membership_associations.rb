class AddConstraintsToMembershipAssociations < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :ecommerce_purchase_invites, :ecommerce_purchases, column: :purchase_id, on_delete: :cascade
    add_foreign_key :ecommerce_purchases, :ecommerce_orders, column: :order_id, on_delete: :cascade
    add_foreign_key :ecommerce_orders, :memberships, column: :membership_id, on_delete: :cascade
    add_foreign_key :communication_emails, :memberships, column: :membership_id, on_delete: :cascade
  end
end
