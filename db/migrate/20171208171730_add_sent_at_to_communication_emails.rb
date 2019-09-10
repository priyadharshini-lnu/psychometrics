# frozen_string_literal: true

class AddSentAtToCommunicationEmails < ActiveRecord::Migration[5.0]
  def change
    add_column :communication_emails, :sent_at, :datetime
  end
end
