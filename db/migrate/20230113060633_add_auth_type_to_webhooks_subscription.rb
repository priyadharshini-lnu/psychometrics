# frozen_string_literal: true

class AddAuthTypeToWebhooksSubscription < ActiveRecord::Migration[6.1]
  def up
    add_column :webhook_subscriptions, :auth_type, :integer, default: 0
    ActiveRecord::Migration[6.1].execute(
      <<-SQL.squish
      UPDATE webhook_subscriptions
      SET auth_type = CASE auth_enabled
        WHEN FALSE THEN 0
        WHEN TRUE THEN 1
      END
      SQL
    )

    remove_column :webhook_subscriptions, :auth_enabled
  end

  def down
    add_column :webhook_subscriptions, :auth_enabled, :boolean
    remove_column :webhook_subscriptions, :auth_type
  end
end
