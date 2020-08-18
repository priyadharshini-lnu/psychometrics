# frozen_string_literal: true

class AddEnableLiveChatToClients < ActiveRecord::Migration[5.1]
  def change
    add_column :clients, :enable_live_chat, :boolean, null: false, default: false
  end
end
