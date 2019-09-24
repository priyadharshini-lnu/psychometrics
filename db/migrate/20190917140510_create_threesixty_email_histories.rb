# frozen_string_literal: true

class CreateThreesixtyEmailHistories < ActiveRecord::Migration[5.1]
  def change
    create_table :threesixty_email_histories do |t|
      t.references :subject, foreign_key: { on_delete: :cascade, to_table: :users }
      t.references :evaluator, foreign_key: { on_delete: :cascade, to_table: :users }
      t.references :threesixty_campaign, foreign_key: { on_delete: :cascade },
        index: { name: :email_histories_campaign }
      t.references :threesixty_email_schedule, foreign_key: { on_delete: :cascade },
        index: { name: :email_histories_email_schedule }
      t.integer :status, limit: 1
      t.json :meta

      t.timestamps
    end
  end
end
