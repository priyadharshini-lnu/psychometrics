# frozen_string_literal: true

class CreateReportsPublishedSnapshots < ActiveRecord::Migration[8.0]
  def change
    create_table :reports_published_snapshots do |t|
      t.references :report, null: false, foreign_key: true, index: { unique: true }
      t.bigint  :tenant_id
      t.jsonb   :data, null: false, default: {}
      t.references :published_by, foreign_key: { to_table: :users }, index: false
      t.datetime :published_at

      t.timestamps
    end
  end
end
