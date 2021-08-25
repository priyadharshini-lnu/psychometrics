# frozen_string_literal: true

class CreateSmtpSettings < ActiveRecord::Migration[5.2]
  def change
    create_table :smtp_settings do |t|
      t.string :from_name
      t.string :from_email
      t.string :host
      t.integer :encryption, default: 0
      t.integer :port
      t.string :user_name
      t.string :encrypted_password
      t.string :encrypted_password_iv
      t.integer :authentication_type, default: 0
      t.boolean :enabled, :boolean, default: false

      t.timestamps
    end

    add_reference :smtp_settings, :project, foreign_key: { on_delete: :cascade, to_table: :clients }, null: false

    Client.projects.find_each(&:create_smtp_setting)
  end
end
