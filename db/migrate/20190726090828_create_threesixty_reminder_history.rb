# frozen_string_literal: true

class CreateThreesixtyReminderHistory < ActiveRecord::Migration[5.1]
  def change
    create_table :threesixty_reminder_histories do |t|
      t.belongs_to :threesixty_campaign, foreign_key: { on_delete: :restrict }, index: {
        name: :threesixty_reminder_histories_cam_id
      }
      t.belongs_to :user, foreign_key: { on_delete: :restrict }
      t.string :email_name
      t.integer :sent_count, default: 0
      t.datetime :last_sent_at
    end
  end
end
