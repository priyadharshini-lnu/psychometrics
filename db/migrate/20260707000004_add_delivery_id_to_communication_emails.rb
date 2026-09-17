# frozen_string_literal: true

class AddDeliveryIdToCommunicationEmails < ActiveRecord::Migration[7.1]
  def change
    add_reference :communication_emails, :communication_delivery, foreign_key: true
  end
end
