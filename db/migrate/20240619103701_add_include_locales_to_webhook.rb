class AddIncludeLocalesToWebhook < ActiveRecord::Migration[7.1]
  def change
    add_column :webhook_subscriptions, :include_locales, :boolean, default: false
  end
end
