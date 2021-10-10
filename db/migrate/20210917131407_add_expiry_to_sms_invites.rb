# frozen_string_literal: true

class AddExpiryToSmsInvites < ActiveRecord::Migration[5.2]
  def change
    add_column :sms_invites, :expiry, :datetime
  end
end
