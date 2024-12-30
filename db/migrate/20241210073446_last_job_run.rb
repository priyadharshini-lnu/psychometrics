# frozen_string_literal: true

class LastJobRun < ActiveRecord::Migration[7.1]
  create_table :last_job_runs do |t|
    t.string :name, null: false
    t.datetime :started_at, null: false
    t.datetime :finished_at, null: false

    t.timestamps
  end
end
