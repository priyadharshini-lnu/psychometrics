# frozen_string_literal: true

class AddMagicLinkExpiryDurationToSecuritySettings < ActiveRecord::Migration[7.1]
  def change
    # 7 days default expiry duration
    add_column :security_settings, :magic_link_expiry_in_seconds, :integer, default: 7.days.to_i, null: false
  end
end
