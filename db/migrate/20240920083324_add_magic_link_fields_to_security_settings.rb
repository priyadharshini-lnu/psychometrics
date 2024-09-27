# frozen_string_literal: true

class AddMagicLinkFieldsToSecuritySettings < ActiveRecord::Migration[7.1]
  def change
    change_table :security_settings, bulk: true do |t|
      t.boolean :magic_link_enabled, default: false
      t.boolean :disallow_password_login, default: false
    end
  end
end
