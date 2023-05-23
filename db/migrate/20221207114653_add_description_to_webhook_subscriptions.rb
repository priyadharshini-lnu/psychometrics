class AddDescriptionToWebhookSubscriptions < ActiveRecord::Migration[6.1]
  def change
    add_column :webhook_subscriptions, :description, :text
  end
end
