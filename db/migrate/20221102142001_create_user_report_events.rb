# frozen_string_literal: true

class CreateUserReportEvents < ActiveRecord::Migration[6.1]
  def change
    create_table :user_report_events do |t|
      t.references :user_report, foreign_key: { on_delete: :cascade, to_table: :users }
      t.string :event_type
      t.references :initiator, foreign_key: { on_delete: :cascade, to_table: :users }
      t.jsonb :details, default: {}

      t.timestamps
    end
  end
end
