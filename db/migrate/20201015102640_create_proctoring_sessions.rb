# frozen_string_literal: true

class CreateProctoringSessions < ActiveRecord::Migration[5.1]
  def change
    enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')

    create_table :proctoring_sessions do |t|
      t.uuid :session_id, default: 'gen_random_uuid()'
      t.references :campaign_user, foreign_key: { on_delete: :cascade }
      t.datetime :started_at
      t.datetime :completed_at
      t.integer :status
      t.jsonb :results, default: {}

      t.timestamps
    end
  end
end
