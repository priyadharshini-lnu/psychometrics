# frozen_string_literal: true

class AddRecipientsToCommunicationDeliveries < ActiveRecord::Migration[7.1]
  def change
    add_column :communication_deliveries, :recipients, :integer
  end
end
