# frozen_string_literal: true

class CreateSystemCheckSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :system_check_sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.datetime :finished_at

      t.timestamps
    end
  end
end
