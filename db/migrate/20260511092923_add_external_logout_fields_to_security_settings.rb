# frozen_string_literal: true

class AddExternalLogoutFieldsToSecuritySettings < ActiveRecord::Migration[8.0]
  def change
    change_table :security_settings, bulk: true do |t|
      t.boolean :external_logout_redirect_enabled, default: false
      t.string :external_logout_url
    end
  end
end
