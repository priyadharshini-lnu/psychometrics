class CreateClientAuditlogExportSettings < ActiveRecord::Migration[7.0]
  def change
    create_table :client_auditlog_export_settings do |t|
      t.integer :destination_type, limit: 2
      t.boolean :active, default: false
      t.string :description
      t.string :s3_access_key_id
      t.string :encrypted_s3_secret_access_key
      t.string :encrypted_s3_secret_access_key_iv
      t.string :s3_bucket_name
      t.string :s3_bucket_folder
      t.string :s3_region
      t.string :s3_endpoint
      t.datetime :last_exported_at
      t.references :client, foreign_key: { on_delete: :cascade }

      t.timestamps
    end
  end
end
