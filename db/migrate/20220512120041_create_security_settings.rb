# frozen_string_literal: true

class CreateSecuritySettings < ActiveRecord::Migration[5.2]
  def change
    create_table :security_settings do |t|
      t.integer :project_id
      t.boolean :enforce_strong_password, default: false
      t.integer :min_password_length, default: 8
      t.boolean :enforce_password_policy, default: false
      t.boolean :disable_password_reuse, default: false
      t.integer :password_expiration
      t.boolean :restrict_sequences, default: false
      t.boolean :lock_account, default: false
      t.integer :attempts_to_lock, default: 3
      t.integer :auto_unlock_time, default: 10
      t.boolean :send_unlock_email, default: false

      t.timestamps
    end

    Client.projects.find_each(&:create_security_setting)
  end
end
