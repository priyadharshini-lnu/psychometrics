class ChangeDefaultCommunicationsDeliveryRule < ActiveRecord::Migration[5.0]
  def up
    change_column :communications, :delivery_rule, :integer, default: :null
  end

  def down
    change_column :communications, :delivery_rule, :integer, default: 0
  end
end
