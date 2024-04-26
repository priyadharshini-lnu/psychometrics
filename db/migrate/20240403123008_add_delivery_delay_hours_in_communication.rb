class AddDeliveryDelayHoursInCommunication < ActiveRecord::Migration[7.1]
  def change
    add_column :communications, :delivery_delay_hours, :integer
  end
end
