# frozen_string_literal: true

class AddLiveChatTokenToClient < ActiveRecord::Migration[5.2]
  def change
    add_column :clients, :live_chat_token, :string
  end
end
