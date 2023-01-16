# frozen_string_literal: true

class RemoveMembershipIdFromHoganCredential < ActiveRecord::Migration[6.1]
  def change
    ActiveRecord::Migration[6.1].execute(
      'UPDATE hogan_credentials SET membership_id = NULL WHERE user_id IS NOT NULL'
    )
  end
end
