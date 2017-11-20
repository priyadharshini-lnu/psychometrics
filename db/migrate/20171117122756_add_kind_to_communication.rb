class AddKindToCommunication < ActiveRecord::Migration[5.0]
  def change
    add_column :communications, :kind, :integer
  end
end
