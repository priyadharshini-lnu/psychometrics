class CreateThreesixtyEmailSchedules < ActiveRecord::Migration[5.1]
  def change
    create_table :threesixty_email_schedules do |t|
      t.belongs_to :threesixty_campaign, foreign_key: { on_delete: :restrict }, index: { name: :threesixty_email_schedule_cam_id }
      t.string :name
      t.string :from
      t.text :subject
      t.string :reply_to_email
      t.text :content
      t.datetime :scheduled_date
      t.jsonb :recipient_criteria
      t.datetime :delivered_at

      t.timestamps
    end
  end
end
