# frozen_string_literal: true

class MigrateEnforceStrongPasswordToSecuritySettings < ActiveRecord::Migration[5.2]
  def up
    Client.projects.all.each do |project|
      project.security_setting.update(enforce_strong_password: project.strong_password_enabled)
    end
  end
end
