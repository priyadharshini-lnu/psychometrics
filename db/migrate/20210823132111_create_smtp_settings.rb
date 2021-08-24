# frozen_string_literal: true

class CreateSmtpSettings < ActiveRecord::Migration[5.2]
  def change
    create_table :smtp_settings do |t|
      t.string :host
      t.integer :encryption
      t.integer :port
      t.string :user_name
      t.string :password
      t.integer :authentication_type
      t.boolean :enabled, :boolean, default: false

      t.timestamps
    end

    add_reference :smtp_settings, :project, foreign_key: { on_delete: :cascade, to_table: :clients }, null: false

    Client.projects.find_each do |project|
      project.create_smtp_setting
    end
  end
end
