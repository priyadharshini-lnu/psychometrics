class AddClientToNotifications < ActiveRecord::Migration[5.0]
  def change
    add_reference :notifications, :client
  end
end
