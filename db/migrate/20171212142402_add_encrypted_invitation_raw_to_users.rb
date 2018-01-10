class AddEncryptedInvitationRawToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :encrypted_invitation_raw, :string
  end
end
