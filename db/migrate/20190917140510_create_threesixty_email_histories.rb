# frozen_string_literal: true

class CreateThreesixtyEmailHistories < ActiveRecord::Migration[5.1]
  def change
    create_table :threesixty_email_histories do |t|
      t.references :subject, foreign_key: { to_table: :users }
      t.references :evaluator, foreign_key: { to_table: :users }
      t.string :recipient_type
      t.references :threesixty_email_schedule, foreign_key: true, index: { name: :email_histories_email_schedule }
      t.integer :status
    end
  end
end
