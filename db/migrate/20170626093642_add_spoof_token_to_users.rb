class AddSpoofTokenToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :spoof_token, :string
  end
end
