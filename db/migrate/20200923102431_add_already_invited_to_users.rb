# frozen_string_literal: true

class AddAlreadyInvitedToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :already_invited, :boolean, default: false
  end
end
