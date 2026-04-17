# frozen_string_literal: true

class CreateTemporaryUploads < ActiveRecord::Migration[7.1]
  def change
    create_table :temporary_uploads do |t|
      t.string :file_key, null: false
      t.string :filename, null: false
      t.string :content_type, null: false
      t.bigint :byte_size, null: false
      t.string :service_name, null: false
      t.string :bucket, null: false
      t.string :checksum
      t.integer :status, null: false, default: 0
      t.references :user, foreign_key: true, null: false

      t.timestamps
    end

    add_index :temporary_uploads, %i[status created_at]
  end
end
