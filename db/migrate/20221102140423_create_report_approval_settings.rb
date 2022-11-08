class CreateReportApprovalSettings < ActiveRecord::Migration[6.1]
  def change
    create_table :report_approval_settings do |t|
      t.references :campaign, foreign_key: { on_delete: :cascade }
      t.references :report, foreign_key: { on_delete: :cascade }
      t.string :qc_user_ids, array: true, default: []
      t.string :approver_user_ids, array: true, default: []
      t.string :approval_notification_user_ids, array: true, default: []

      t.timestamps
    end

    add_index :report_approval_settings, :qc_user_ids, using: 'gin'
    add_index :report_approval_settings, :approver_user_ids, using: 'gin'
    add_index :report_approval_settings, :approval_notification_user_ids, using: 'gin', name: 'ur_approval_notification_user_ids_index'
    add_index :report_approval_settings, [:campaign_id, :report_id], unique: true
  end
end
