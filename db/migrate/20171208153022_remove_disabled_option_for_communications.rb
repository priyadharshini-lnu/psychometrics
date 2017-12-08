class RemoveDisabledOptionForCommunications < ActiveRecord::Migration[5.0]
  def change
    remove_column :communications, :disabled, :boolean, default: false
  end
end
