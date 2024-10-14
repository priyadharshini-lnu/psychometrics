# frozen_string_literal: true

class AddUserIdToCommunicationEmails < ActiveRecord::Migration[7.1]
  def change
    add_column :communication_emails, :user_id, :bigint
  end
end
