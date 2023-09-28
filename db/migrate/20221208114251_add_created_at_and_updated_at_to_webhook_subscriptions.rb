class AddCreatedAtAndUpdatedAtToWebhookSubscriptions < ActiveRecord::Migration[6.1]
  def change
    add_column :webhook_subscriptions, :created_at, :datetime
    add_column :webhook_subscriptions, :updated_at, :datetime
  end
end
