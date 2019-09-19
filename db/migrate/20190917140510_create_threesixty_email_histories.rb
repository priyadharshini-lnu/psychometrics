# frozen_string_literal: true

class CreateThreesixtyEmailHistories < ActiveRecord::Migration[5.1]
  def change
    create_table :threesixty_email_histories do |t|
      t.references :subject, foreign_key: { to_table: :users }
      t.references :evaluator, foreign_key: { to_table: :users }
      t.references :threesixty_campaign, foreign_key: true, index: { name: :email_histories_campaign }
      t.references :threesixty_email_schedule, foreign_key: true, index: { name: :email_histories_email_schedule }
      t.string :recipient_type
      t.integer :status
      t.json :meta

      t.timestamps
    end
  end
end
