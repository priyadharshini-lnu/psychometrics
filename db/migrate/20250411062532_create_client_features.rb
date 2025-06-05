# frozen_string_literal: true

class CreateClientFeatures < ActiveRecord::Migration[7.1]
  def change
    create_table :client_features do |t|
      t.references :client, foreign_key: true
      t.boolean :sms_notification, null: false, default: false

      t.timestamps
    end

    ActiveRecord::Base.connection.execute('SELECT * from clients').each do |client|
      sql = <<~SQL.squish
        INSERT INTO client_features (client_id, created_at, updated_at)
        VALUES ($1, NOW(), NOW())
      SQL
      exec_query(sql, 'SQL', [client['id']])
    end
  end
end
