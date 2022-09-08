# frozen_string_literal: true

class Add2faEnabledToSecuritySettings < ActiveRecord::Migration[6.1]
  def up
    add_column :security_settings, :tfa_enabled, :boolean, default: false

    Client.projects.find_each do |client|
      client.security_setting.update(tfa_enabled: client.two_factor_enabled)
    end

    remove_column :clients, :two_factor_enabled
  end

  def down
    add_column :clients, :two_factor_enabled, :boolean
    remove_column :security_settings, :tfa_enabled, :boolean
  end
end
