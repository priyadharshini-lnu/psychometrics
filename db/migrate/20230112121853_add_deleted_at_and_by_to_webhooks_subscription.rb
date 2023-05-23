class AddDeletedAtAndByToWebhooksSubscription < ActiveRecord::Migration[6.1]
  def change
    add_column :webhook_subscriptions, :deleted_at, :datetime
    add_reference :webhook_subscriptions, :deleted_by, foreign_key: { on_delete: :nullify, to_table: :users }
  end
end
