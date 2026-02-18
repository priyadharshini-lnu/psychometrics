# frozen_string_literal: true

class CreateAIScoringApprovalSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_scoring_approval_settings do |t|
      t.bigint :assessor_ids, array: true, default: []
      t.bigint :approver_ids, array: true, default: []
      t.boolean :allow_bulk_approve, default: false
      t.boolean :allow_bulk_approve_scores, default: false
      t.boolean :send_digest_emails, default: false
      t.string :digest_frequency, default: 'daily'
      t.time :digest_time, default: '21:00:00'
      t.integer :digest_weekdays, array: true, default: []
      t.string :digest_timezone, default: 'Asia/Dubai'
      t.string :digest_delivery_mode, default: 'immediate'
      t.datetime :last_digest_sent_at
      t.datetime :digest_emails_enabled_at

      t.references :assessment, foreign_key: true, null: false, index: true
      t.references :campaign, foreign_key: true, null: false, index: true
      t.timestamps
    end

    add_index :ai_scoring_approval_settings, :assessor_ids, using: 'gin'
    add_index :ai_scoring_approval_settings, :approver_ids, using: 'gin'
    add_index :ai_scoring_approval_settings, %i[campaign_id assessment_id], unique: true
  end
end
